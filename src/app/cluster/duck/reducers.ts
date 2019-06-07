import { Types } from './actions';
import { createReducer } from 'reduxsauce';
import ConnectionState from '../../common/connection_state';

export const INITIAL_STATE = {
  isError: false,
  isFetching: false,
  clusterList: [],
  searchTerm: '',
  connectionState: ConnectionState.Pending,
};

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  // TODO: Obviously thsi needs to be removed when connected is actually implemented!
  const clusterList = action.clusterList.map(cluster => {
    cluster.status = 'success';
    return cluster;
  });
  return { ...state, clusterList, isFetching: false };
};
export const clusterFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};
export const clusterFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};
export const setConnectionState = (state = INITIAL_STATE, action) => {
  return { ...state, connectionState: action.connectionState };
};
export const addClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [...state.clusterList, action.newCluster],
  };
};
export const removeClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: state.clusterList.filter(item => item.Cluster.metadata.name !== action.name),
  };
};
export const updateClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [ ...state.clusterList.filter(
      s => s.Cluster.metadata.name !== action.updatedCluster.Cluster.metadata.name), { ...action.updatedCluster } ] };
};

export const updateSearchTerm = (state = INITIAL_STATE, action) => {
  return { ...state, searchTerm: action.searchTerm };
};

export const HANDLERS = {
  [Types.CLUSTER_FETCH_REQUEST]: clusterFetchRequest,
  [Types.CLUSTER_FETCH_SUCCESS]: clusterFetchSuccess,
  [Types.CLUSTER_FETCH_FAILURE]: clusterFetchFailure,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [Types.UPDATE_CLUSTER_SUCCESS]: updateClusterSuccess,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,
  [Types.UPDATE_SEARCH_TERM]: updateSearchTerm,
  [Types.SET_CONNECTION_STATE]: setConnectionState,
};

export default createReducer(INITIAL_STATE, HANDLERS);
