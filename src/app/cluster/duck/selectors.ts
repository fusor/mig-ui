import { createSelector } from 'reselect';

const clusterSelector = (state) =>
    state.cluster.clusterList.map(c => c.MigCluster);

const searchTermSelector = state => state.cluster.searchTerm;

const getVisibleClusters = createSelector(
    [clusterSelector, searchTermSelector],
    (clusters, searchTerm) => {
        return clusters.filter(cluster => cluster.metadata.name.match(new RegExp(searchTerm, 'i')));
    },
);
export default {
    getVisibleClusters,
};
