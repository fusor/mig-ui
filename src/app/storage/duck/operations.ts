import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import ConnectionState from '../../common/connection_state';

import { CoreNamespacedResource, CoreNamespacedResourceKind } from '../../../client/resources';

import {
  createClusterRegistryObj,
  createStorageSecret,
  createMigStorage,
  updateMigStorage,
  updateStorageSecret,
} from '../../../client/resources/conversions';
import { commonOperations } from '../../common/duck';

const migStorageFetchRequest = Creators.migStorageFetchRequest;
const migStorageFetchSuccess = Creators.migStorageFetchSuccess;
const migStorageFetchFailure = Creators.migStorageFetchFailure;
const addStorageSuccess = Creators.addStorageSuccess;
const updateStorageSuccess = Creators.updateStorageSuccess;
const addStorageFailure = Creators.addStorageFailure;
const removeStorageSuccess = Creators.removeStorageSuccess;
const removeStorageFailure = Creators.removeStorageFailure;
const updateSearchTerm = Creators.updateSearchTerm;

const addStorage = storageValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const tokenSecret = createStorageSecret(
        storageValues.name,
        migMeta.namespace,
        storageValues.secret,
        storageValues.accessKey
      );

      const migStorage = createMigStorage(
        storageValues.name,
        storageValues.bucketName,
        storageValues.bucketRegion,
        migMeta.namespace,
        tokenSecret
      );

      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.namespace
      );
      const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);
      const arr = await Promise.all([
        client.create(secretResource, tokenSecret),
        client.create(migStorageResource, migStorage),
      ]);

      const storage = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      storage.status = storageValues.connectionStatus;
      dispatch(addStorageSuccess(storage));
      dispatch(commonOperations.alertSuccessTimeout('Successfully added a repository!'));
    } catch (err) {
      dispatch(
        commonOperations.alertErrorTimeout(err.response.data.message || 'Failed to fetch storage')
      );
    }
  };
};

const updateStorage = storageValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const tokenSecret = updateStorageSecret(
        storageValues.secret,
        storageValues.accessKey
      );

      const migStorage = updateMigStorage(
        storageValues.bucketName,
        storageValues.bucketRegion,
      );

      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.namespace
      );
      const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);

      const arr = await Promise.all([
        client.patch(secretResource, storageValues.name, tokenSecret),
        client.patch(migStorageResource, storageValues.name, migStorage),
      ]);

      const storage = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      storage.status = storageValues.connectionStatus;

      dispatch(updateStorageSuccess(storage));
      dispatch(commonOperations.alertSuccessTimeout(`Successfully updated repository "${storageValues.name}"!`));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};


function checkConnection() {
  return (dispatch, getState) => {
    dispatch(Creators.setConnectionState(ConnectionState.Checking));
    setTimeout(() => {
      dispatch(Creators.setConnectionState(ConnectionState.Success));
    }, 500);
  };
}

const removeStorage = (name) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.namespace
      );
      const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);

      const arr = await Promise.all([
        client.delete(secretResource, name),
        client.delete(migStorageResource, name),
      ]);

      dispatch(removeStorageSuccess(name));
      dispatch(commonOperations.alertSuccessTimeout(`Successfully removed repository "${name}"!`));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

const fetchStorage = () => {
  return async (dispatch, getState) => {
    dispatch(migStorageFetchRequest());

    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);
      const res = await client.list(resource);
      //temporary for ui work
      const migStorages = res.data.items;
      const refs = await Promise.all(fetchMigStorageRefs(client, migMeta, migStorages));
      const groupedStorages = groupStorages(migStorages, refs);
      dispatch(migStorageFetchSuccess(groupedStorages));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
      dispatch(migStorageFetchFailure());
    }
  };
};
function fetchMigStorageRefs(client: IClusterClient, migMeta, migStorages): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migStorages.forEach(storage => {
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
  return migStorages.map(ms => {
    const fullStorage = {
      MigStorage: ms,
    };
    fullStorage['Secret'] = refs.find(
      i => i.data.kind === 'Secret' && i.data.metadata.name === ms.metadata.name
    ).data;

    return fullStorage;
  });
}

export default {
  fetchStorage,
  addStorage,
  updateStorage,
  removeStorage,
  updateSearchTerm,
  checkConnection,
};
