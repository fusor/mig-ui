import { IMigPlan } from '../../../client/resources/conversions';
import { ICurrentPlanStatus } from './reducers';
import { IAddEditStatus } from '../../common/add_edit_state';

export const PlanActionTypes = {
  UPDATE_PLANS: 'UPDATE_PLANS',
  ADD_PLAN_SUCCESS: 'ADD_PLAN_SUCCESS',
  ADD_PLAN_FAILURE: 'ADD_PLAN_FAILURE',
  UPDATE_PLAN_RESULTS: 'UPDATE_PLAN_RESULTS',
  REMOVE_PLAN_SUCCESS: 'REMOVE_PLAN_SUCCESS',
  UPDATE_STAGE_PROGRESS: 'UPDATE_STAGE_PROGRESS',
  STAGING_SUCCESS: 'STAGING_SUCCESS',
  STAGING_FAILURE: 'STAGING_FAILURE',
  MIGRATION_SUCCESS: 'MIGRATION_SUCCESS',
  MIGRATION_FAILURE: 'MIGRATION_FAILURE',
  UPDATE_PLAN_LIST: 'UPDATE_PLAN_LIST',
  UPDATE_CURRENT_PLAN_STATUS: 'UPDATE_CURRENT_PLAN_STATUS',
  UPDATE_PLAN_MIGRATIONS: 'UPDATE_PLAN_MIGRATIONS',
  MIG_PLAN_FETCH_REQUEST: 'MIG_PLAN_FETCH_REQUEST',
  MIG_PLAN_FETCH_SUCCESS: 'MIG_PLAN_FETCH_SUCCESS',
  MIG_PLAN_FETCH_FAILURE: 'MIG_PLAN_FETCH_FAILURE',
  NAMESPACE_FETCH_REQUEST: 'NAMESPACE_FETCH_REQUEST',
  NAMESPACE_FETCH_SUCCESS: 'NAMESPACE_FETCH_SUCCESS',
  NAMESPACE_FETCH_FAILURE: 'NAMESPACE_FETCH_FAILURE',
  SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS: 'SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS',
  START_PV_POLLING: 'START_PV_POLLING',
  STOP_PV_POLLING: 'STOP_PV_POLLING',
  ADD_PLAN_REQUEST: 'ADD_PLAN_REQUEST',
  PLAN_UPDATE_REQUEST: 'PLAN_UPDATE_REQUEST',
  PLAN_UPDATE_SUCCESS: 'PLAN_UPDATE_SUCCESS',
  PLAN_UPDATE_FAILURE: 'PLAN_UPDATE_FAILURE',
  PLAN_RESULTS_REQUEST: 'PLAN_RESULTS_REQUEST',
  INIT_STAGE: 'INIT_STAGE',
  INIT_MIGRATION: 'INIT_MIGRATION',
  PLAN_CLOSE_AND_DELETE_REQUEST: 'PLAN_CLOSE_AND_DELETE_REQUEST',
  PLAN_CLOSE_AND_DELETE_SUCCESS: 'PLAN_CLOSE_AND_DELETE_SUCCESS',
  PLAN_CLOSE_AND_DELETE_FAILURE: 'PLAN_CLOSE_AND_DELETE_FAILURE',
  PLAN_CLOSE_REQUEST: 'PLAN_CLOSE_REQUEST',
  PLAN_CLOSE_SUCCESS: 'PLAN_CLOSE_SUCCESS',
  PLAN_CLOSE_FAILURE: 'PLAN_CLOSE_FAILURE',
  CLOSED_STATUS_POLL_START: 'CLOSED_STATUS_POLL_START',
  CLOSED_STATUS_POLL_STOP: 'CLOSED_STATUS_POLL_STOP',
  PLAN_STATUS_POLL_START: 'PLAN_STATUS_POLL_START',
  PLAN_STATUS_POLL_STOP: 'PLAN_STATUS_POLL_STOP',
  GET_PV_RESOURCES_REQUEST: 'GET_PV_RESOURCES_REQUEST',
  GET_PV_RESOURCES_SUCCESS: 'GET_PV_RESOURCES_SUCCESS',
  GET_PV_RESOURCES_FAILURE: 'GET_PV_RESOURCES_FAILURE',
  PLAN_POLL_START: 'PLAN_POLL_START',
  PLAN_POLL_STOP: 'PLAN_POLL_STOP',
  RESET_CURRENT_PLAN: 'RESET_CURRENT_PLAN',
  SET_CURRENT_PLAN: 'SET_CURRENT_PLAN',
  SET_LOCKED_PLAN: 'SET_LOCKED_PLAN',
  SET_PLAN_ADD_EDIT_STATUS: 'SET_PLAN_ADD_EDIT_STATUS',
  WATCH_PLAN_ADD_EDIT_STATUS: 'SET_PLAN_ADD_EDIT_STATUS',
  PV_UPDATE_REQUEST: 'PV_UPDATE_REQUEST',
  PV_UPDATE_SUCCESS: 'PV_UPDATE_SUCCESS',
};

const updateCurrentPlanStatus = (currentPlanStatus: ICurrentPlanStatus) => ({
  type: PlanActionTypes.UPDATE_CURRENT_PLAN_STATUS,
  currentPlanStatus,
});

const setPlanAddEditStatus = (status: IAddEditStatus) => ({
  type: PlanActionTypes.SET_PLAN_ADD_EDIT_STATUS,
  status,
});

const watchPlanAddEditStatus = (planName) => ({
  type: PlanActionTypes.WATCH_PLAN_ADD_EDIT_STATUS,
  planName,
});


const updatePlans = (updatedPlans: IMigPlan[]) => ({
  type: PlanActionTypes.UPDATE_PLANS,
  updatedPlans,
});

const addPlanSuccess = (newPlan: IMigPlan) => ({
  type: PlanActionTypes.ADD_PLAN_SUCCESS,
  newPlan,
});

const addPlanFailure = (error) => ({
  type: PlanActionTypes.ADD_PLAN_FAILURE,
  error,
});

const removePlanSuccess = (id) => ({
  type: PlanActionTypes.REMOVE_PLAN_SUCCESS,
  id,
});

const updateStageProgress = (planName: string, progress: any) => ({
  type: PlanActionTypes.UPDATE_STAGE_PROGRESS,
  planName,
  progress,
});

const stagingSuccess = (planName: string) => ({
  type: PlanActionTypes.STAGING_SUCCESS,
  planName,
});

const stagingFailure = (err) => ({
  type: PlanActionTypes.STAGING_FAILURE,
  err,
});

const migrationSuccess = (planName: string) => ({
  type: PlanActionTypes.MIGRATION_SUCCESS,
  planName,
});

const migrationFailure = (err) => ({
  type: PlanActionTypes.MIGRATION_FAILURE,
  err
});

const updatePlanList = (updatedPlan: IMigPlan) => ({
  type: PlanActionTypes.UPDATE_PLAN_LIST,
  updatedPlan,
});

const updatePlanMigrations = (updatedPlan: IMigPlan) => ({
  type: PlanActionTypes.UPDATE_PLAN_MIGRATIONS,
  updatedPlan,
});


const migPlanFetchRequest = () => ({
  type: PlanActionTypes.MIG_PLAN_FETCH_REQUEST,
});

const migPlanFetchSuccess = (migPlanList: IMigPlan[]) => ({
  type: PlanActionTypes.MIG_PLAN_FETCH_SUCCESS,
  migPlanList,
});

const migPlanFetchFailure = () => ({
  type: PlanActionTypes.MIG_PLAN_FETCH_FAILURE,
});

const sourceClusterNamespacesFetchSuccess = (sourceClusterNamespaces: any[]) => ({
  type: PlanActionTypes.SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS,
  sourceClusterNamespaces,
});

const namespaceFetchRequest = () => ({
  type: PlanActionTypes.NAMESPACE_FETCH_REQUEST,
});

const namespaceFetchSuccess = (sourceClusterNamespaces: any[]) => ({
  type: PlanActionTypes.NAMESPACE_FETCH_SUCCESS,
  sourceClusterNamespaces,
});

const namespaceFetchFailure = (err) => ({
  type: PlanActionTypes.NAMESPACE_FETCH_FAILURE,
  err,
});

const pvUpdateRequest = () => ({
  type: PlanActionTypes.PV_UPDATE_REQUEST,
});

const pvUpdateSuccess = () => ({
  type: PlanActionTypes.PV_UPDATE_SUCCESS,
});

const planUpdateRequest = (planValues, isRerunPVDiscovery?) => ({
  type: PlanActionTypes.PLAN_UPDATE_REQUEST,
  planValues,
  isRerunPVDiscovery
});

const planUpdateSuccess = () => ({
  type: PlanActionTypes.PLAN_UPDATE_SUCCESS,
});

const planUpdateFailure = (error) => ({
  type: PlanActionTypes.PLAN_UPDATE_FAILURE,
  error
});

const addPlanRequest = () => ({
  type: PlanActionTypes.ADD_PLAN_REQUEST,
});

const initStage = (planName: string) => ({
  type: PlanActionTypes.INIT_STAGE,
  planName,
});

const initMigration = (planName: string) => ({
  type: PlanActionTypes.INIT_MIGRATION,
  planName,
});

const planCloseAndDeleteRequest = (planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_AND_DELETE_REQUEST,
  planName,
});

const planCloseAndDeleteSuccess = (planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_AND_DELETE_SUCCESS,
  planName,
});

const planCloseAndDeleteFailure = (err) => ({
  type: PlanActionTypes.PLAN_CLOSE_AND_DELETE_FAILURE,
  err,
});

const planCloseRequest = (planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_REQUEST,
  planName
});

const planCloseSuccess = () => ({
  type: PlanActionTypes.PLAN_CLOSE_SUCCESS,
});

const planCloseFailure = (err) => ({
  type: PlanActionTypes.PLAN_CLOSE_FAILURE,
  err
});

const startClosedStatusPolling = (planName) => ({
  type: PlanActionTypes.CLOSED_STATUS_POLL_START,
  planName,
});

const stopClosedStatusPolling = (planName) => ({
  type: PlanActionTypes.CLOSED_STATUS_POLL_STOP,
  planName
});

const getPVResourcesRequest = (pvList: any, clusterName: string) => ({
  type: PlanActionTypes.GET_PV_RESOURCES_REQUEST,
  pvList,
  clusterName
});

const getPVResourcesSuccess = (pvResources) => ({
  type: PlanActionTypes.GET_PV_RESOURCES_SUCCESS,
  pvResources
});

const getPVResourcesFailure = (error) => ({
  type: PlanActionTypes.GET_PV_RESOURCES_FAILURE,
  error
});

const startPlanStatusPolling = (planName) => ({
  type: PlanActionTypes.PLAN_STATUS_POLL_START,
  planName,
});

const stopPlanStatusPolling = () => ({
  type: PlanActionTypes.PLAN_STATUS_POLL_STOP,
});

const startPlanPolling = (params?: any) => ({
  type: PlanActionTypes.PLAN_POLL_START,
  params,
});

const stopPlanPolling = () => ({
  type: PlanActionTypes.PLAN_POLL_STOP,
});

const resetCurrentPlan = () => ({
  type: PlanActionTypes.RESET_CURRENT_PLAN,
});

const setCurrentPlan = (currentPlan) => ({
  type: PlanActionTypes.SET_CURRENT_PLAN,
  currentPlan
});


const setLockedPlan = (planName) => ({
  type: PlanActionTypes.SET_LOCKED_PLAN,
  planName
});

export const PlanActions = {
  updatePlans,
  addPlanSuccess,
  addPlanFailure,
  removePlanSuccess,
  updateStageProgress,
  stagingSuccess,
  stagingFailure,
  migrationSuccess,
  migrationFailure,
  updatePlanList,
  updateCurrentPlanStatus,
  updatePlanMigrations,
  migPlanFetchRequest,
  migPlanFetchSuccess,
  migPlanFetchFailure,
  sourceClusterNamespacesFetchSuccess,
  namespaceFetchRequest,
  namespaceFetchSuccess,
  namespaceFetchFailure,
  pvUpdateRequest,
  pvUpdateSuccess,
  planUpdateRequest,
  planUpdateSuccess,
  planUpdateFailure,
  addPlanRequest,
  initStage,
  initMigration,
  planCloseAndDeleteRequest,
  planCloseAndDeleteSuccess,
  planCloseAndDeleteFailure,
  planCloseSuccess,
  planCloseFailure,
  planCloseRequest,
  startClosedStatusPolling,
  stopClosedStatusPolling,
  startPlanStatusPolling,
  stopPlanStatusPolling,
  getPVResourcesRequest,
  getPVResourcesSuccess,
  getPVResourcesFailure,
  startPlanPolling,
  stopPlanPolling,
  resetCurrentPlan,
  setCurrentPlan,
  setLockedPlan,
  setPlanAddEditStatus,
  watchPlanAddEditStatus
};
