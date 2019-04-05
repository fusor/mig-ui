import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import {
  ClusterRegistryResource,
  ClusterRegistryResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import {
  createClusterRegistryObj,
  createTokenSecret,
  createMigCluster,
} from '../../../client/resources/conversions';
import { MigResource, MigResourceKind } from '../../../client/resources';

const clusterFetchSuccess = Creators.clusterFetchSuccess;
const addClusterSuccess = Creators.addClusterSuccess;
const removeClusterSuccess = Creators.removeClusterSuccess;
const removeClusterFailure = Creators.removeClusterFailure;

const addCluster = clusterValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      const clusterReg = createClusterRegistryObj(
        clusterValues.name, migMeta.namespace, clusterValues.url);
      const tokenSecret = createTokenSecret(
        clusterValues.name, migMeta.configNamespace, clusterValues.token);
      const migCluster = createMigCluster(
        clusterValues.name, migMeta.namespace, clusterReg, tokenSecret);

      const clusterRegResource = new ClusterRegistryResource(
        ClusterRegistryResourceKind.Cluster, migMeta.namespace);
      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret, migMeta.configNamespace);
      const migClusterResource = new MigResource(
        MigResourceKind.MigCluster, migMeta.namespace);

      const arr = await Promise.all([
        client.create(clusterRegResource, clusterReg),
        client.create(secretResource, tokenSecret),
        client.create(migClusterResource, migCluster),
      ]);
      const cluster = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      dispatch(addClusterSuccess(cluster));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

const removeCluster = id => {
  throw new Error('NOT IMPLEMENTED');
  // return dispatch => {
  //   removeClusterRequest(id).then(
  //     response => {
  //       dispatch(removeClusterSuccess(id));
  //       dispatch(fetchClusters());
  //     },
  //     error => {
  //       dispatch(removeClusterFailure(error));
  //     },
  //   );
  // };
};

const fetchClusters = () => {
  return async (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const resource = new MigResource(
        MigResourceKind.MigCluster, migMeta.namespace);

      const res = await client.list(resource);
      const migClusters = res.data.items;
      const nonHostClusters = migClusters.filter(c => !c.spec.isHostCluster);
      const refs = await Promise.all(fetchMigClusterRefs(client, migMeta, nonHostClusters));
      const groupedClusters = groupClusters(migClusters, refs);
      dispatch(clusterFetchSuccess(groupedClusters));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

export default {
  fetchClusters,
  addCluster,
  removeCluster,
};

function fetchMigClusterRefs(
  client: IClusterClient, migMeta, migClusters,
): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migClusters.forEach(cluster => {
    const clusterRef = cluster.spec.clusterRef;
    const secretRef = cluster.spec.serviceAccountSecretRef;
    const clusterRegResource = new ClusterRegistryResource(
      ClusterRegistryResourceKind.Cluster, clusterRef.namespace);
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret, secretRef.namespace);
    refs.push(client.get(clusterRegResource, clusterRef.name));
    refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupClusters(migClusters: any[], refs: any[]): any[] {
  return migClusters.map(mc => {
    const fullCluster  = {
      'MigCluster': mc,
    };

    if (!mc.spec.isHostCluster) {
      fullCluster['Cluster'] = refs.find(i => {
        return i.data.kind === 'Cluster' &&
          i.data.metadata.name === mc.metadata.name;
      }).data;
      fullCluster['Secret'] = refs.find(i => {
        return i.data.kind === 'Secret' &&
          i.data.metadata.name === mc.metadata.name;
      }).data;
    }

    return fullCluster;
  });
}
