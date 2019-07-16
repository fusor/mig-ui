import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  CoreClusterResource,
  CoreClusterResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';

import {
  createMigPlan,
  createMigMigration,
  createMigPlanNoStorage,
  updateMigPlanFromValues,
} from '../../../client/resources/conversions';
import { commonOperations } from '../../common/duck';
import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';
import { groupPlan, groupPlans, getMigrationStatus, getPlanStatus, getPlanPVs } from './utils';
import { select } from 'redux-saga/effects';
import { updateDataListPollingStats } from '../../common/duck/actions';

/* tslint:disable */
const uuidv1 = require('uuid/v1');
/* tslint:enable */
const migPlanFetchRequest = Creators.migPlanFetchRequest;
const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const migPlanFetchFailure = Creators.migPlanFetchFailure;
const pvFetchRequest = Creators.pvFetchRequest;
const pvFetchFailure = Creators.pvFetchFailure;
const pvFetchSuccess = Creators.pvFetchSuccess;
const migrationSuccess = Creators.migrationSuccess;
const stagingSuccess = Creators.stagingSuccess;
const migrationFailure = Creators.migrationFailure;
const stagingFailure = Creators.stagingFailure;
const addPlanSuccess = Creators.addPlanSuccess;
const addPlanFailure = Creators.addPlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initStage(plan.MigPlan.metadata.name));
      dispatch(commonOperations.alertProgressTimeout('Staging Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        true
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);
      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = groupPlan(plan, migrationListResponse);

      const statusPollingCallback = updatedPlansPollingResponse => {
        if (updatedPlansPollingResponse && updatedPlansPollingResponse.isSuccessful === true) {
          const type = 'STAGE';
          return getStatusCondition(dispatch, updatedPlansPollingResponse, createMigRes, type);
        }
      };

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        callback: statusPollingCallback,
      };

      dispatch(Creators.startStatusPolling(params));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
      dispatch(stagingFailure(err));
    }
  };
};

const runMigration = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initMigration(plan.MigPlan.metadata.name));
      dispatch(commonOperations.alertProgressTimeout('Migration Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        false
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);

      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = groupPlan(plan, migrationListResponse);

      const statusPollingCallback = updatedPlansPollingResponse => {
        if (updatedPlansPollingResponse && updatedPlansPollingResponse.isSuccessful === true) {
          const type = 'MIGRATION';
          return getStatusCondition(dispatch, updatedPlansPollingResponse, createMigRes, type);
        }
      };

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        callback: statusPollingCallback,
      };

      dispatch(Creators.startStatusPolling(params));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
      dispatch(migrationFailure(err));
    }
  };
};

const addPlan = migPlan => {
  return async (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migPlanObj = createMigPlanNoStorage(
        migPlan.planName,
        migMeta.namespace,
        migPlan.sourceCluster,
        migPlan.targetCluster,
        migPlan.namespaces
      );

      const createPlanRes = await client.create(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlanObj
      );

      const statusPollingCallback = updatedPlansPollingResponse => {
        if (updatedPlansPollingResponse && updatedPlansPollingResponse.isSuccessful === true) {
          const type = 'PLAN';
          return getStatusCondition(dispatch, updatedPlansPollingResponse, createPlanRes, type);
        }
      };

      const statusParams = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        callback: statusPollingCallback,
      };

      dispatch(Creators.startStatusPolling(statusParams));

      const pvPollingCallback = updatedPlansPollingResponse => {
        if (updatedPlansPollingResponse && updatedPlansPollingResponse.isSuccessful === true) {
          return getPVs(dispatch, updatedPlansPollingResponse, createPlanRes);
        }
      };

      const pvParams = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        callback: pvPollingCallback,
      };

      dispatch(Creators.pvFetchRequest());
      dispatch(Creators.startPVPolling(pvParams));
      dispatch(addPlanSuccess(createPlanRes.data));
    } catch (err) {
      dispatch(addPlanFailure());
      dispatch(commonOperations.alertErrorTimeout(err.toString()));
    }
  };
};

const putPlan = planValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const migMeta = state.migMeta;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      // When updating objects
      const latestPlanRes = await client.get(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        planValues.planName
      );
      const latestPlan = latestPlanRes.data;

      dispatch(Creators.updatePlan(latestPlan));
      const updatedMigPlan = updateMigPlanFromValues(latestPlan, planValues);

      const putRes = await client.put(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        latestPlan.metadata.name,
        updatedMigPlan
      );
      // TODO: Need some kind of retry logic here in case the resourceVersion
      // gets ticked up in between us getting and putting the mutated object back
      dispatch(Creators.updatePlan(putRes.data));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

const removePlan = id => {
  throw new Error('NOT IMPLEMENTED');
};

const fetchPlans = () => {
  return async (dispatch, getState) => {
    dispatch(migPlanFetchRequest());
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(MigResourceKind.MigPlan, migMeta.namespace);
      const res = await client.list(resource);
      const migPlans = res.data.items || [];

      const refs = await Promise.all(fetchMigMigrationsRefs(client, migMeta, migPlans));
      const groupedPlans = groupPlans(migPlans, refs);
      dispatch(migPlanFetchSuccess(groupedPlans));
    } catch (err) {
      if (err.response) {
        dispatch(commonOperations.alertErrorTimeout(err.response.data.message));
      } else if (err.message) {
        dispatch(commonOperations.alertErrorTimeout(err.message));
      } else {
        dispatch(
          commonOperations.alertErrorTimeout('Failed to fetch plans: An unknown error occurred')
        );
      }
      dispatch(migPlanFetchFailure());
    }
  };
};
function fetchMigMigrationsRefs(client: IClusterClient, migMeta, migPlans): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migPlans.forEach(plan => {
    const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);
    refs.push(client.list(migMigrationResource));
  });

  return refs;
}

const fetchNamespacesForCluster = clusterName => {
  return async (dispatch, getState) => {
    const client: IClusterClient = ClientFactory.forCluster(clusterName, getState());
    const nsResource = new CoreClusterResource(CoreClusterResourceKind.Namespace);
    try {
      const res = await client.list(nsResource);
      dispatch(sourceClusterNamespacesFetchSuccess(res.data.items));
    } catch (err) {
      if (isSelfSignedCertError(err)) {
        const failedUrl = `${client.apiRoot}${nsResource.listPath()}`;
        handleSelfSignedCertError(failedUrl, dispatch);
        return;
      }
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

function* fetchPlansGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.hostCluster(state);
  const resource = new MigResource(MigResourceKind.MigPlan, state.migMeta.namespace);
  try {
    let planList = yield client.list(resource);
    planList = yield planList.data.items;
    const refs = yield Promise.all(fetchMigMigrationsRefs(client, state.migMeta, planList));
    const groupedPlans = yield groupPlans(planList, refs);
    return { updatedPlans: groupedPlans, isSuccessful: true };
  } catch (e) {
    return { e, isSuccessful: false };
  }
}
const getPVs = (dispatch, updatedPlansPollingResponse, newObjectRes) => {
  const matchingPlan = updatedPlansPollingResponse.updatedPlans
    .filter(p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name)
    .pop();

  const pvSearchStatus = matchingPlan ? getPlanPVs(matchingPlan) : null;
  if (pvSearchStatus.success) {
    dispatch(Creators.updatePlan(matchingPlan.MigPlan));
    dispatch(pvFetchSuccess());
    dispatch(commonOperations.alertSuccessTimeout('Found PVs!'));

    return 'SUCCESS';
  } else if (pvSearchStatus.error) {
    return 'FAILURE';
  }
};
const getStatusCondition = (dispatch, updatedPlansPollingResponse, newObjectRes, type) => {
  switch (type) {
    case 'STAGE': {
      const matchingPlan = updatedPlansPollingResponse.updatedPlans
        .filter(p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name)
        .pop();

      const migStatus = matchingPlan ? getMigrationStatus(matchingPlan, newObjectRes) : null;
      if (migStatus.success) {
        dispatch(stagingSuccess(newObjectRes.data.spec.migPlanRef.name));
        dispatch(commonOperations.alertSuccessTimeout('Staging Successful'));
        return 'SUCCESS';
      } else if (migStatus.error) {
        dispatch(stagingFailure());
        dispatch(commonOperations.alertErrorTimeout('Staging Failed'));
        return 'FAILURE';
      }
      break;
    }

    case 'MIGRATION': {
      const matchingPlan = updatedPlansPollingResponse.updatedPlans
        .filter(p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name)
        .pop();
      const migStatus = matchingPlan ? getMigrationStatus(matchingPlan, newObjectRes) : null;
      if (migStatus.success) {
        dispatch(migrationSuccess(newObjectRes.data.spec.migPlanRef.name));
        dispatch(commonOperations.alertSuccessTimeout('Migration Successful'));
        return 'SUCCESS';
      } else if (migStatus.error) {
        dispatch(migrationFailure());
        dispatch(commonOperations.alertErrorTimeout('Migration Failed'));
        return 'FAILURE';
      }
      break;
    }
    case 'PLAN': {
      const matchingPlan = updatedPlansPollingResponse.updatedPlans
        .filter(p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name)
        .pop();

      const planStatus = matchingPlan ? getPlanStatus(matchingPlan) : null;
      if (planStatus.success) {
        return 'SUCCESS';
      } else if (planStatus.error) {
        return 'FAILURE';
      }
      break;
    }
  }
  return;
};

export default {
  pvFetchRequest,
  fetchPlans,
  addPlan,
  putPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
  fetchMigMigrationsRefs,
  fetchPlansGenerator,
};
