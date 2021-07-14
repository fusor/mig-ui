import {
  takeLatest,
  select,
  race,
  take,
  call,
  put,
  delay,
  StrictEffect,
  SimpleEffect,
  Effect,
} from 'redux-saga/effects';
import {
  createStorageSecret,
  createMigStorage,
  updateMigStorage,
  updateStorageSecret,
  IMigStorage,
} from '../../../client/resources/conversions';
import { StorageActions, StorageActionTypes } from './actions';
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
import { alertSuccessTimeout, alertErrorTimeout } from '../../common/duck/slice';
import { DefaultRootState } from '../../../configureStore';
import { IStorage } from './types';
import { ICondition } from '../../plan/duck/types';
import {
  ClientFactory,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
  IClusterClient,
} from '@konveyor/lib-ui';
import { MigResource, MigResourceKind } from '../../../client/helpers';

function fetchMigStorageRefs(
  client: IClusterClient,
  migStorages: Array<IMigStorage>
): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migStorages.forEach((storage) => {
    const secretRef = storage.spec.backupStorageConfig.credsSecretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupStorages(migStorages: any[], refs: any[]): any[] {
  return migStorages.map((ms) => {
    const fullStorage = {
      MigStorage: ms,
      Secret: '',
    };
    // TODO: When VSL configuration is supported separate from BSL,
    // this needs to be updated to support two different, distinct secrets
    fullStorage['Secret'] = refs.find(
      (ref) =>
        ref.data.kind === 'Secret' &&
        ref.data.metadata.name === ms.spec.backupStorageConfig.credsSecretRef.name
    ).data;

    return fullStorage;
  });
}

function* fetchStorageGenerator(): Generator<any, any, any> {
  const state: DefaultRootState = yield select();
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
  const resource = new MigResource(MigResourceKind.MigStorage, state.auth.migMeta.namespace);
  try {
    let storageList = yield client.list(resource);
    storageList = yield storageList.data.items;
    const refs = yield Promise.all(fetchMigStorageRefs(client, storageList as IMigStorage[]));
    const groupedStorages = groupStorages(storageList, refs);
    return { updatedStorages: groupedStorages };
  } catch (e) {
    throw e;
  }
}

function* removeStorageSaga(action: any): Generator<any, any, any> {
  try {
    const state: DefaultRootState = yield select();
    const { migMeta } = state.auth;
    const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
    const { name } = action;

    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace
    );
    const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);

    const getMigStorageResult = yield client.get(migStorageResource, name);

    if (getMigStorageResult.status !== 200) {
      throw new Error('Error retrieving MigStorage object');
    }

    yield Promise.all([
      client.delete(
        secretResource,
        getMigStorageResult.data.spec.backupStorageConfig.credsSecretRef.name
      ),
      client.delete(migStorageResource, name),
    ]);

    yield put(StorageActions.removeStorageSuccess(name));
    yield put(alertSuccessTimeout(`Successfully removed replication repository "${name}"!`));
  } catch (err) {
    yield put(alertErrorTimeout(err));
  }
}

function* addStorageRequest(action: any): Generator<any, any, any> {
  const state: DefaultRootState = yield select();
  const { migMeta } = state.auth;
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
  const { storageValues } = action;

  const storageSecret = createStorageSecret(
    storageValues.name,
    migMeta.configNamespace,
    storageValues.bslProvider,
    storageValues.secret,
    storageValues.accessKey,
    storageValues.gcpBlob,
    storageValues.azureBlob
  );

  const migStorage = createMigStorage(
    storageValues.name,
    storageValues.bslProvider,
    migMeta.namespace,
    storageSecret,
    storageValues.requireSSL,
    storageValues.caBundle,
    storageValues.awsBucketName,
    storageValues.awsBucketRegion,
    storageValues.s3Url,
    storageValues.gcpBucket,
    storageValues.azureResourceGroup,
    storageValues.azureStorageAccount
  );

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);

  // Ensure that an existing storage with same name does not exist
  try {
    const getResult = yield client.get(migStorageResource, migStorage.metadata.name);

    if (getResult.status === 200) {
      const message = 'Storage object with this name already exists';
      console.error(message);
      yield put(
        StorageActions.setStorageAddEditStatus(
          createAddEditStatusWithMeta(AddEditState.Critical, AddEditMode.Add, message, '')
        )
      );
      return;
    }
  } catch (err) {
    console.error(err.message);
  }

  const storageAddResults = [];

  // Attempt creating a storage secret, return on failure
  try {
    storageAddResults.push(yield client.create(secretResource, storageSecret));
  } catch (err) {
    console.error('Storage Secret failed creation with error', err);
    put(alertErrorTimeout('Storage Secret failed creation'));
    return;
  }

  const createdStorageSecret = storageAddResults[0].data;
  try {
    // Attempt creating the storage, rollback previously created secret on failure
    try {
      Object.assign(migStorage.spec.backupStorageConfig.credsSecretRef, {
        name: createdStorageSecret.metadata.name,
        namespace: createdStorageSecret.metadata.namespace,
      });

      Object.assign(migStorage.spec.volumeSnapshotConfig.credsSecretRef, {
        name: createdStorageSecret.metadata.name,
        namespace: createdStorageSecret.metadata.namespace,
      });

      storageAddResults.push(yield client.create(migStorageResource, migStorage));
    } catch {
      // attempt rolling back secret
      yield client.delete(secretResource, createdStorageSecret.metadata.name);
    }

    const storage = storageAddResults.reduce((accum, res) => {
      const data = res.data;
      accum[data.kind] = data;
      return accum;
    }, {});

    yield put(StorageActions.addStorageSuccess(storage));
    yield put(StorageActions.setCurrentStorage(storage));

    // Push into watching state
    yield put(
      StorageActions.setStorageAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    yield put(StorageActions.watchStorageAddEditStatus(storageValues.name));
  } catch (err) {
    console.error('Storage failed creation with error: ', err);
    put(alertErrorTimeout('Storage failed creation'));
    return;
  }
}

function* watchAddStorageRequest() {
  yield takeLatest(StorageActionTypes.ADD_STORAGE_REQUEST, addStorageRequest);
}

const accessKeyIdSecretField = 'aws-access-key-id';
const secretAccessKeySecretField = 'aws-secret-access-key';

function* updateStorageRequest(action: any): Generator<any, any, any> {
  // TODO: Probably need rollback logic here too if any fail
  const state: DefaultRootState = yield select();
  const { migMeta } = state.auth;
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
  const { storageValues } = action;

  const currentStorage = state.storage.migStorageList.find((c) => {
    return c.MigStorage.metadata.name === storageValues.name;
  });

  // Check to see if any fields on the MigStorage were updated
  //AWS
  const currentBucketName = currentStorage.MigStorage.spec.backupStorageConfig.awsBucketName;

  const bucketNameUpdated = storageValues.awsBucketName !== currentBucketName;

  const currentRegion = currentStorage.MigStorage.spec.backupStorageConfig.awsRegion;

  const regionUpdated = storageValues.awsBucketRegion !== currentRegion;

  const currentS3Url = currentStorage.MigStorage.spec.backupStorageConfig.awsS3Url;

  const s3UrlUpdated = storageValues.s3Url !== currentS3Url;

  const currentRequireSSL = !currentStorage.MigStorage.spec.backupStorageConfig.insecure;
  const requireSSLUpdated = storageValues.requireSSL !== currentRequireSSL;

  const currentCABundle = currentStorage.MigStorage.spec.backupStorageConfig.s3CustomCABundle;
  const caBundleUpdated = storageValues.caBundle !== currentCABundle;
  //
  //GCP
  const currentGCPBucketName = currentStorage.MigStorage.spec.backupStorageConfig.gcpBucket;

  const gcpBucketNameUpdated = storageValues.gcpBucket !== currentGCPBucketName;
  //
  //Azure
  const currentAzureResourceGroup =
    currentStorage.MigStorage.spec.backupStorageConfig.azureResourceGroup;

  const azureResourceGroupUpdated = storageValues.azureResourceGroup !== currentAzureResourceGroup;

  const currentAzureStorageAccount =
    currentStorage.MigStorage.spec.backupStorageConfig.azureStorageAccount;

  const azureStorageAccountUpdated =
    storageValues.azureStorageAccount !== currentAzureStorageAccount;
  //

  const migStorageUpdated =
    //AWS
    bucketNameUpdated ||
    regionUpdated ||
    s3UrlUpdated ||
    requireSSLUpdated ||
    caBundleUpdated ||
    //GCP
    gcpBucketNameUpdated ||
    //Azure
    azureResourceGroupUpdated ||
    azureStorageAccountUpdated;

  // Check to see if any fields on the kube secret were updated
  // NOTE: Need to decode the b64 token off a k8s secret
  //AW S
  let currentAccessKey;
  if (currentStorage.Secret.data[accessKeyIdSecretField]) {
    currentAccessKey = atob(currentStorage.Secret.data[accessKeyIdSecretField]);
  }
  const accessKeyUpdated = storageValues.accessKey !== currentAccessKey;

  let currentSecret;
  if (currentStorage.Secret.data[secretAccessKeySecretField]) {
    currentSecret = atob(currentStorage.Secret.data[secretAccessKeySecretField]);
  }

  const secretUpdated = storageValues.secret !== currentSecret;
  //
  //GCP
  let currentGCPBlob;
  if (currentStorage.Secret.data['gcp-credentials']) {
    currentGCPBlob = atob(currentStorage.Secret.data['gcp-credentials']);
  }

  const gcpBlobUpdated = storageValues.gcpBlob !== currentGCPBlob;
  //
  // AZURE
  let currentAzureBlob;
  if (currentStorage.Secret.data['azure-credentials']) {
    currentAzureBlob = atob(currentStorage.Secret.data['azure-credentials']);
  }
  const azureBlobUpdated = storageValues.azureBlob !== currentAzureBlob;
  //

  const kubeSecretUpdated = accessKeyUpdated || secretUpdated || gcpBlobUpdated || azureBlobUpdated;

  if (!migStorageUpdated && !kubeSecretUpdated) {
    console.warn('A storage update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  if (migStorageUpdated) {
    const updatedMigStorage = updateMigStorage(
      storageValues.bslProvider,
      storageValues.awsBucketName,
      storageValues.awsBucketRegion,
      storageValues.s3Url,
      storageValues.gcpBucket,
      storageValues.azureResourceGroup,
      storageValues.azureStorageAccount,
      storageValues.requireSSL,
      storageValues.caBundle
    );
    const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() =>
      client.patch(migStorageResource, storageValues.name, updatedMigStorage)
    );
  }

  if (kubeSecretUpdated) {
    const updatedSecret = updateStorageSecret(
      storageValues.bslProvider,
      storageValues.secret,
      storageValues.accessKey,
      storageValues.gcpBlob,
      storageValues.azureBlob
    );
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace
    );

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() =>
      client.patch(
        secretResource,
        currentStorage.MigStorage.spec.backupStorageConfig.credsSecretRef.name,
        updatedSecret
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

    // Need to merge the grouped results onto the currentStorage since
    // its possible the grouped results was only a partial update
    // Ex: could have just been a MigStorage or a Secret
    const updatedStorage = { ...currentStorage, ...groupedResults };

    // Update the state tree with the updated storage, and start to watch
    // again to check for its condition after edits
    yield put(StorageActions.updateStorageSuccess(updatedStorage));
    yield put(StorageActions.setCurrentStorage(updatedStorage));

    yield put(
      StorageActions.setStorageAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    yield put(StorageActions.watchStorageAddEditStatus(storageValues.name));
  } catch (err) {
    console.error('NOT IMPLEMENTED: An error occurred during updateStorageRequest:', err);
    // TODO: What are we planning on doing in the event of an update failure?
    // TODO: We probably even need retry logic here...
  }
}

function* watchUpdateStorageRequest() {
  yield takeLatest(StorageActionTypes.UPDATE_STORAGE_REQUEST, updateStorageRequest);
}
// function* pollStorageAddEditStatus(action: string): Generator<StrictEffect, number, any> {
// function* pollStorageAddEditStatus(action: any): Generator<number, 'done!', boolean> {
function* pollStorageAddEditStatus(action: any): Generator<any, any, any> {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while (true) {
    try {
      const state: DefaultRootState = yield select();
      const { migMeta } = state.auth;
      const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
      const { storageName } = action;

      const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);
      const storagePollResult = yield client.get(migStorageResource, storageName);

      const hasStatusAndConditions = storagePollResult.data.status?.conditions;

      if (hasStatusAndConditions) {
        const criticalCond = storagePollResult.data.status.conditions.find((cond: ICondition) => {
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

        const readyCond = storagePollResult.data.status.conditions.find((cond: ICondition) => {
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
      console.error('Hard error branch hit in poll storage add edit', err);
      return;
    }
  }
}

function* startWatchingStorageAddEditStatus(action: any): any {
  // Start a race, poll until the watch is cancelled (by closing the modal),
  // polling times out, or the condition is added, in that order of precedence.
  const raceResult = yield race({
    addEditResult: call(pollStorageAddEditStatus, action),
    timeout: delay(AddEditWatchTimeout),
    cancel: take(StorageActions.cancelWatchStorageAddEditStatus().type),
  });

  if (raceResult.cancel) {
    return;
  }

  const addEditResult: IAddEditStatus = raceResult.addEditResult;

  const statusToDispatch =
    addEditResult || createAddEditStatus(AddEditState.TimedOut, AddEditMode.Edit);

  yield put(StorageActions.setStorageAddEditStatus(statusToDispatch));
}

function* watchStorageAddEditStatus() {
  yield takeLatest(
    StorageActionTypes.WATCH_STORAGE_ADD_EDIT_STATUS,
    startWatchingStorageAddEditStatus
  );
}

function* watchRemoveStorageRequest() {
  yield takeLatest(StorageActionTypes.REMOVE_STORAGE_REQUEST, removeStorageSaga);
}

export default {
  fetchStorageGenerator,
  watchRemoveStorageRequest,
  watchAddStorageRequest,
  watchUpdateStorageRequest,
  watchStorageAddEditStatus,
};
