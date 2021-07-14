import { takeLatest, select, race, take, call, put, delay, StrictEffect } from 'redux-saga/effects';
import {
  ClientFactory,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
  IClusterClient,
} from '@konveyor/lib-ui';
import {
  createMigClusterSecret,
  createMigCluster,
  updateTokenSecret,
  getTokenSecretLabelSelector,
} from '../../../client/resources/conversions';

import { ClusterActions, ClusterActionTypes } from './actions';
import {
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  IAddEditStatus,
  AddEditWatchTimeout,
  AddEditWatchTimeoutPollInterval,
  AddEditConditionCritical,
  createAddEditStatusWithMeta,
  AddEditConditionReady,
  AddEditDebounceWait,
} from '../../common/add_edit_state';
import { PlanActions } from '../../plan/duck';
import utils from '../../common/duck/utils';
import { ICluster, IMigCluster } from './types';
import Q from 'q';
import { alertSuccessTimeout, alertErrorTimeout, alertErrorModal } from '../../common/duck/slice';
import { certErrorOccurred } from '../../auth/duck/slice';
import { DefaultRootState } from '../../../configureStore';
import { IMigMeta } from '../../auth/duck/types';
import { ICondition } from '../../plan/duck/types';
import { MigResource, MigResourceKind } from '../../../client/helpers';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { DiscoveryResource, NamespaceDiscovery } from '../../../client/resources/discovery';
import { DiscoveryFactory } from '../../../client/discovery_factory';

function* getState(): Generator<StrictEffect, DefaultRootState, DefaultRootState> {
  const res: DefaultRootState = yield select();
  return res;
}

function fetchMigClusterRefs(
  client: IClusterClient,
  migMeta: IMigMeta,
  migClusters: IMigCluster[]
): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migClusters.forEach((cluster) => {
    const secretRef = cluster.spec.serviceAccountSecretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupClusters(migClusters: IMigCluster[], refs: any[]): ICluster[] {
  return migClusters.map((mc) => {
    const fullCluster: ICluster = {
      MigCluster: mc,
      Secret: null,
    };

    if (!mc.spec.isHostCluster) {
      fullCluster['Secret'] = refs.find(
        (i) =>
          i.data.kind === 'Secret' && i.data.metadata.name === mc.spec.serviceAccountSecretRef.name
      ).data;
    }

    return fullCluster;
  });
}

function* fetchClustersGenerator(): Generator<any, any, any> {
  const state = yield* getState();
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
  const resource = new MigResource(MigResourceKind.MigCluster, state.auth.migMeta.namespace);
  try {
    let clusterList = yield client.list(resource);
    clusterList = yield clusterList.data.items;
    const nonHostClusters = clusterList.filter((c: IMigCluster) => !c.spec.isHostCluster);
    const refs = yield Promise.all(
      fetchMigClusterRefs(client, state.auth.migMeta, nonHostClusters)
    );
    const groupedClusters = groupClusters(clusterList, refs);
    return { updatedClusters: groupedClusters };
  } catch (e) {
    throw e;
  }
}

function* removeClusterSaga(action: any): Generator<any, any, any> {
  try {
    const state = yield* getState();
    const { migMeta } = state.auth;
    const { name } = action;
    const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');

    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace
    );
    const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

    const secretResourceList = yield client.list(
      secretResource,
      getTokenSecretLabelSelector(MigResourceKind.MigCluster, name)
    );

    const secretResourceName =
      secretResourceList.data.items && secretResourceList.data.items.length > 0
        ? secretResourceList.data.items[0].metadata.name
        : '';

    yield Promise.all([
      client.delete(secretResource, secretResourceName),
      client.delete(migClusterResource, name),
    ]);

    yield put(ClusterActions.removeClusterSuccess(name));
    yield put(alertSuccessTimeout(`Successfully removed cluster "${name}"!`));
  } catch (err) {
    yield put(alertErrorTimeout(err));
    yield put(ClusterActions.removeClusterFailure(err));
  }
}

function* addClusterRequest(action: any): Generator<any, any, any> {
  const state: DefaultRootState = yield select();
  const { migMeta } = state.auth;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');

  const tokenSecret = createMigClusterSecret(
    clusterValues.name,
    migMeta.configNamespace,
    clusterValues.token,
    MigResourceKind.MigCluster,
    clusterValues.name
  );

  const migCluster = createMigCluster(
    clusterValues.name,
    migMeta.namespace,
    clusterValues.url,
    tokenSecret,
    clusterValues.isAzure,
    clusterValues.azureResourceGroup,
    clusterValues.requireSSL,
    clusterValues.caBundle,
    clusterValues.exposedRegistryPath
  );

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

  // Ensure that none of objects that make up a cluster already exist
  try {
    const getResults = yield Q.allSettled([
      client.list(
        secretResource,
        getTokenSecretLabelSelector(MigResourceKind.MigCluster, migCluster.metadata.name)
      ),
      client.get(migClusterResource, migCluster.metadata.name),
    ]);

    const alreadyExists = getResults.reduce((exists: any, res: any) => {
      return res && res.status === 200
        ? [
            ...exists,
            {
              kind: res.value.data.kind,
              name:
                res.value.data.items && res.value.data.items.length > 0
                  ? res.value.data.items[0].metadata.name
                  : res.value.data.metadata.name,
            },
          ]
        : exists;
    }, []);

    if (alreadyExists.length > 0) {
      throw new Error(
        alreadyExists.reduce((msg: any, v: any) => {
          return msg + `- kind: "${v.kind}", name: "${v.name}"`;
        }, 'Some cluster objects already exist ')
      );
    }
  } catch (err) {
    console.error(err.message);
    yield put(
      ClusterActions.setClusterAddEditStatus(
        createAddEditStatusWithMeta(AddEditState.Critical, AddEditMode.Add, err.message, '')
      )
    );
    return;
  }

  // None of the objects already exist, so try to create all of the objects
  // If any of the objects actually fail creation, we need to rollback the others
  // so the clusters are created, or fail atomically
  try {
    const clusterAddResults = [];
    const tokenSecretAddResult = yield client.create(secretResource, tokenSecret);

    if (tokenSecretAddResult.status === 201) {
      clusterAddResults.push(tokenSecretAddResult);

      Object.assign(migCluster.spec.serviceAccountSecretRef, {
        name: tokenSecretAddResult.data.metadata.name,
        namespace: tokenSecretAddResult.data.metadata.namespace,
      });

      const clusterAddResult = yield client.create(migClusterResource, migCluster);

      if (clusterAddResult.status === 201) {
        clusterAddResults.push(clusterAddResult);
      }
    }

    // If any of the attempted object creation promises have failed, we need to
    // rollback those that succeeded so we don't have a halfway created "Cluster"
    // A rollback is only required if some objects have actually *succeeded*,
    // as well as failed.
    const isRollbackRequired =
      clusterAddResults.find((res) => res.status === 201) &&
      clusterAddResults.find((res) => res.status !== 201);

    if (isRollbackRequired) {
      const kindToResourceMap: any = {
        MigCluster: migClusterResource,
        Secret: secretResource,
      };

      // The objects that need to be rolled back are those that were fulfilled
      const rollbackObjs = clusterAddResults.reduce((rollbackAccum, res) => {
        return res.status === 201
          ? [...rollbackAccum, { kind: res.data.kind, name: res.data.metadata.name }]
          : rollbackAccum;
      }, []);

      const rollbackResults = yield Q.allSettled(
        rollbackObjs.map((r: any) => {
          return client.delete(kindToResourceMap[r.kind], r.name);
        })
      );

      // Something went wrong with rollback, not much we can do at this point
      // except inform the user about what's gone wrong so they can take manual action
      if (rollbackResults.find((res: any) => res.state === 'rejected')) {
        throw new Error(
          rollbackResults.reduce((msg: string, r: any) => {
            const kind = r.reason.request.response.kind;
            const name = r.reason.request.response.details.name;
            return msg + `- kind: ${kind}, name: ${name}`;
          }, 'Attempted to rollback objects, but failed ')
        );
      } else {
        // One of the objects failed, but rollback was successful. Need to alert
        // the user that something went wrong, but we were able to recover with
        // a rollback
        throw Error(clusterAddResults.find((res) => res.state === 'rejected').reason);
      }
    } // End rollback handling

    const cluster = clusterAddResults.reduce((accum, res) => {
      const data = res.data;
      accum[data.kind] = data;
      return accum;
    }, {});

    yield put(ClusterActions.addClusterSuccess(cluster));
    yield put(ClusterActions.setCurrentCluster(cluster));

    // Push into watching state
    yield put(
      ClusterActions.setClusterAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    yield put(ClusterActions.watchClusterAddEditStatus(clusterValues.name));
  } catch (err) {
    console.error('Cluster failed creation with error: ', err);
    put(alertErrorTimeout('Cluster failed creation'));
    return;
  }
}

function* watchAddClusterRequest() {
  yield takeLatest(ClusterActionTypes.ADD_CLUSTER_REQUEST, addClusterRequest);
}

function* updateClusterRequest(action: any): Generator<any, any, any> {
  // TODO: Probably need rollback logic here too if any fail
  const state = yield* getState();
  const { migMeta } = state.auth;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');

  const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);
  const getClusterRes = yield client.get(migClusterResource, clusterValues.name);
  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    getClusterRes?.data?.spec.serviceAccountSecretRef.namespace
      ? getClusterRes.data.spec.serviceAccountSecretRef.namespace
      : migMeta.configNamespace
  );
  const updatedMigClusterSecretResult = yield client.get(
    secretResource,
    getClusterRes.data.spec.serviceAccountSecretRef.name
  );
  const currentCluster = {
    MigCluster: getClusterRes.data,
    Secret: updatedMigClusterSecretResult.data,
  };

  const currentUrl = currentCluster.MigCluster.spec.url;
  const urlUpdated = clusterValues.url !== currentUrl;

  // NOTE: Need to decode the b64 token
  const currentToken = atob(currentCluster.Secret.data.saToken);
  const tokenUpdated = clusterValues.token !== currentToken;

  const currentAzureResource = currentCluster.MigCluster.spec.azureResourceGroup;
  const azureUpdated =
    clusterValues.azureResourceGroup !== currentAzureResource ||
    clusterValues.isAzure !== currentAzureResource.length > 0;

  const currentRequireSSL = !currentCluster.MigCluster.spec.insecure;
  const requireSSLUpdated = clusterValues.requireSSL !== currentRequireSSL;

  const currentCABundle = currentCluster.MigCluster.spec.caBundle;
  const caBundleUpdated = clusterValues.caBundle !== currentCABundle;

  const currentExposedRegistryPath = currentCluster.MigCluster.spec.exposedRegistryPath;
  const exposedRegistryPathUpdated =
    clusterValues.exposedRegistryPath !== currentExposedRegistryPath;

  if (
    !urlUpdated &&
    !tokenUpdated &&
    !azureUpdated &&
    !requireSSLUpdated &&
    !caBundleUpdated &&
    !exposedRegistryPathUpdated
  ) {
    console.warn('A cluster update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  const aggregatedPatch: any = { spec: {} };

  if (urlUpdated) {
    aggregatedPatch.spec['url'] = clusterValues.url.trim();
  }

  if (azureUpdated) {
    if (clusterValues.isAzure) {
      aggregatedPatch.spec['azureResourceGroup'] = clusterValues.azureResourceGroup;
    } else {
      aggregatedPatch.spec['azureResourceGroup'] = '';
    }
  }

  if (requireSSLUpdated) {
    aggregatedPatch.spec['insecure'] = !clusterValues.requireSSL;
  }
  if (caBundleUpdated) {
    aggregatedPatch.spec['caBundle'] = clusterValues.caBundle || null;
  }

  if (exposedRegistryPathUpdated) {
    aggregatedPatch.spec['exposedRegistryPath'] = clusterValues.exposedRegistryPath
      .replace(/^https?\:\/\//i, '')
      .trim();
  }

  if (
    urlUpdated ||
    azureUpdated ||
    requireSSLUpdated ||
    caBundleUpdated ||
    exposedRegistryPathUpdated
  ) {
    const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);
    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() =>
      client.patch(migClusterResource, clusterValues.name, aggregatedPatch)
    );
  }

  if (tokenUpdated) {
    const isMigTokenSecret = false;
    const newTokenSecret = updateTokenSecret(clusterValues.token, isMigTokenSecret);
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace
    );

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() =>
      client.patch(
        secretResource,
        currentCluster.MigCluster.spec.serviceAccountSecretRef.name,
        newTokenSecret
      )
    );
  }

  try {
    // Convert reqfns to promises, executing the requsts in the process
    // Then yield a wrapper all promise to the saga middleware and wait
    // on the results
    const results = yield Promise.all(updatePromises.map((reqfn) => reqfn()));

    const groupedResults = results.reduce((accum: any, res: any) => {
      accum[res.data.kind] = res.data;
      return accum;
    }, {});

    // Need to merge the grouped results onto the currentCluster since
    // its possible the grouped results was only a partial update
    // Ex: could have just been a Cluster or a Secret
    const updatedCluster = { ...currentCluster, ...groupedResults };

    // Update the state tree with the updated cluster, and start to watch
    // again to check for its condition after edits
    yield put(ClusterActions.setCurrentCluster(updatedCluster));

    yield put(
      ClusterActions.setClusterAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    yield put(ClusterActions.watchClusterAddEditStatus(clusterValues.name));
  } catch (err) {
    console.error('NOT IMPLEMENTED: An error occurred during updateClusterRequest:', err);
    // TODO: What are we planning on doing in the event of an update failure?
    // TODO: We probably even need retry logic here...
  }
}

function* watchUpdateClusterRequest() {
  yield takeLatest(ClusterActionTypes.UPDATE_CLUSTER_REQUEST, updateClusterRequest);
}

function* pollClusterAddEditStatus(action: any): Generator<any, any, any> {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while (true) {
    try {
      const state = yield* getState();
      const { migMeta } = state.auth;
      const { clusterName } = action;

      const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);
      const clusterPollResult = yield client.get(migClusterResource, clusterName);

      const hasStatusAndConditions =
        clusterPollResult.data.status && clusterPollResult.data.status.conditions;

      if (hasStatusAndConditions) {
        const criticalCond = clusterPollResult.data.status.conditions.find((cond: ICondition) => {
          return cond.category === AddEditConditionCritical;
        });

        if (criticalCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Critical,
            AddEditMode.Edit,
            criticalCond.message,
            criticalCond.reason
          );
        }

        const readyCond = clusterPollResult.data.status.conditions.find((cond: ICondition) => {
          return cond.type === AddEditConditionReady;
        });

        if (readyCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Ready,
            AddEditMode.Edit,
            readyCond.message,
            '' // Ready has no reason
          );
        }
      }

      // No conditions found, let's wait a bit and keep checking
      yield delay(AddEditWatchTimeoutPollInterval);
    } catch (err) {
      // TODO: what happens when the poll fails? Back into that hard error state?
      console.error('Hard error branch hit in poll cluster add edit', err);
      return;
    }
  }
}

function* startWatchingClusterAddEditStatus(action: any): Generator<any, any, any> {
  // Start a race, poll until the watch is cancelled (by closing the modal),
  // polling times out, or the condition is added, in that order of precedence.
  const raceResult = yield race({
    addEditResult: call(pollClusterAddEditStatus, action),
    timeout: delay(AddEditWatchTimeout),
    cancel: take(ClusterActionTypes.CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS),
  });

  if (raceResult.cancel) {
    return;
  }

  const addEditResult: IAddEditStatus = raceResult.addEditResult;

  const statusToDispatch =
    addEditResult || createAddEditStatus(AddEditState.TimedOut, AddEditMode.Edit);

  yield put(ClusterActions.setClusterAddEditStatus(statusToDispatch));
}

function* watchClusterAddEditStatus() {
  yield takeLatest(
    ClusterActionTypes.WATCH_CLUSTER_ADD_EDIT_STATUS,
    startWatchingClusterAddEditStatus
  );
}

function* watchRemoveClusterRequest() {
  yield takeLatest(ClusterActionTypes.REMOVE_CLUSTER_REQUEST, removeClusterSaga);
}

function* initDiscoveryCert() {
  // Purpose of this saga to be run early so the user is able to accept the disco
  // svc cert if required before they hit the service as part of normal application
  // usage. There's nothing to be done here with the response payload.

  // There's a race condition here where the this initDiscoCert fn is called
  // prior to the initial loading of the clusters. We need to make sure to retrieve
  // the name of the host cluster off of the MigCluster object rather than hard code it,
  // because although it defaults to "host", there are conditions where the user can change
  // it. Pulling it off of the MigCluster itself ensures we have the authoratative value.
  // If no clusters have been loaded when we try to get the value, we'll just sleep in
  // the background and keep trying until they've been loaded; there is always at least one
  // cluster that represents the cluster that the controller runs on (and this is the cluster we
  // need).
  const CLUSTER_RETRY_PERIOD = 3000;
  while (true) {
    const state: DefaultRootState = yield select();
    if (state.cluster.clusterList.length == 0) {
      yield delay(CLUSTER_RETRY_PERIOD);
      continue;
    }
    const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
      state.auth.user,
      state.auth.migMeta.namespace,
      '/discovery-api'
    );
    const hostCluster: ICluster = state.cluster.clusterList.find(
      (c) => c.MigCluster.spec.isHostCluster
    );
    const hostClusterName = hostCluster?.MigCluster?.metadata.name;
    const namespaces: DiscoveryResource = new NamespaceDiscovery(hostClusterName);
    try {
      yield discoveryClient.get(namespaces);
      break;
    } catch (err) {
      if (utils.isTimeoutError(err)) {
        yield put(alertErrorTimeout('Timed out while fetching namespaces'));
        break;
      } else if (utils.isSelfSignedCertError(err)) {
        const failedUrl = `${discoveryClient.apiRoot()}/${namespaces.path()}`;
        const alertModalObj = {
          name: 'Discovery service cert',
          errorMessage: '',
        };
        yield put(alertErrorModal(alertModalObj));
        yield put(certErrorOccurred(failedUrl));
        break;
      }
      yield put(PlanActions.namespaceFetchFailure(err));
      yield put(alertErrorTimeout('Failed to fetch namespaces'));
      break;
    }
  }
}

function* watchInitDiscoveryCert() {
  yield takeLatest(ClusterActionTypes.INIT_DISCOVERY_CERT, initDiscoveryCert);
}

export default {
  watchRemoveClusterRequest,
  watchAddClusterRequest,
  watchUpdateClusterRequest,
  watchInitDiscoveryCert,
  watchClusterAddEditStatus,
  fetchClustersGenerator,
};
