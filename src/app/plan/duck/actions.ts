import { IMigPlan, IMigHook } from '../../../client/resources/conversions';
import { ICurrentPlanStatus } from './reducers';
import { IAddEditStatus } from '../../common/add_edit_state';

export const PlanActionTypes = {
  RUN_STAGE_REQUEST: 'RUN_STAGE_REQUEST',
  RUN_MIGRATION_REQUEST: 'RUN_MIGRATION_REQUEST',
  UPDATE_PLANS: 'UPDATE_PLANS',
  ADD_PLAN_REQUEST: 'ADD_PLAN_REQUEST',
  ADD_PLAN_SUCCESS: 'ADD_PLAN_SUCCESS',
  ADD_PLAN_FAILURE: 'ADD_PLAN_FAILURE',
  VALIDATE_PLAN_FAILURE: 'VALIDATE_PLAN_FAILURE',
  VALIDATE_PLAN_REQUEST: 'VALIDATE_PLAN_REQUEST',
  VALIDATE_PLAN_SUCCESS: 'VALIDATE_PLAN_SUCCESS',
  VALIDATE_PLAN_POLL_START: 'VALIDATE_PLAN_POLL_START',
  VALIDATE_PLAN_POLL_STOP: 'VALIDATE_PLAN_POLL_STOP',
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
  PLAN_UPDATE_REQUEST: 'PLAN_UPDATE_REQUEST',
  PLAN_UPDATE_SUCCESS: 'PLAN_UPDATE_SUCCESS',
  PLAN_UPDATE_FAILURE: 'PLAN_UPDATE_FAILURE',
  PLAN_RESULTS_REQUEST: 'PLAN_RESULTS_REQUEST',
  INIT_STAGE: 'INIT_STAGE',
  INIT_MIGRATION: 'INIT_MIGRATION',
  MIGRATION_CANCEL_REQUEST: 'MIGRATION_CANCEL_REQUEST',
  MIGRATION_CANCEL_SUCCESS: 'MIGRATION_CANCEL_SUCCESS',
  MIGRATION_CANCEL_FAILURE: 'MIGRATION_CANCEL_FAILURE',
  PLAN_CLOSE_AND_DELETE_REQUEST: 'PLAN_CLOSE_AND_DELETE_REQUEST',
  PLAN_CLOSE_AND_DELETE_SUCCESS: 'PLAN_CLOSE_AND_DELETE_SUCCESS',
  PLAN_CLOSE_AND_DELETE_FAILURE: 'PLAN_CLOSE_AND_DELETE_FAILURE',
  PLAN_CLOSE_REQUEST: 'PLAN_CLOSE_REQUEST',
  PLAN_CLOSE_SUCCESS: 'PLAN_CLOSE_SUCCESS',
  PLAN_CLOSE_FAILURE: 'PLAN_CLOSE_FAILURE',
  PLAN_STATUS_POLL_START: 'PLAN_STATUS_POLL_START',
  PLAN_STATUS_POLL_STOP: 'PLAN_STATUS_POLL_STOP',
  PV_UPDATE_POLL_STOP: 'PV_UPDATE_POLL_STOP',
  MIGRATION_POLL_START: 'MIGRATION_POLL_START',
  MIGRATION_POLL_STOP: 'MIGRATION_POLL_STOP',
  STAGE_POLL_START: 'STAGE_POLL_START',
  STAGE_POLL_STOP: 'STAGE_POLL_STOP',
  GET_PV_RESOURCES_REQUEST: 'GET_PV_RESOURCES_REQUEST',
  GET_PV_RESOURCES_SUCCESS: 'GET_PV_RESOURCES_SUCCESS',
  GET_PV_RESOURCES_FAILURE: 'GET_PV_RESOURCES_FAILURE',
  PLAN_POLL_START: 'PLAN_POLL_START',
  PLAN_POLL_STOP: 'PLAN_POLL_STOP',
  RESET_CURRENT_PLAN: 'RESET_CURRENT_PLAN',
  SET_CURRENT_PLAN: 'SET_CURRENT_PLAN',
  PV_UPDATE_REQUEST: 'PV_UPDATE_REQUEST',
  PV_UPDATE_SUCCESS: 'PV_UPDATE_SUCCESS',

  /*
  Hook action types
  */

  UPDATE_HOOK_REQUEST: 'UPDATE_HOOK_REQUEST',
  UPDATE_HOOK_FAILURE: 'UPDATE_HOOK_FAILURE',
  UPDATE_HOOK_SUCCESS: 'UPDATE_HOOK_SUCCESS',
  ADD_HOOK_REQUEST: 'ADD_HOOK_REQUEST',
  ADD_HOOK_FAILURE: 'ADD_HOOK_FAILURE',
  ADD_HOOK_SUCCESS: 'ADD_HOOK_SUCCESS',
  HOOK_FETCH_REQUEST: 'HOOK_FETCH_REQUEST',
  HOOK_FETCH_FAILURE: 'HOOK_FETCH_FAILURE',
  HOOK_FETCH_SUCCESS: 'HOOK_FETCH_SUCCESS',
  SET_HOOK_ADD_EDIT_STATUS: 'SET_HOOK_ADD_EDIT_STATUS',
  WATCH_HOOK_ADD_EDIT_STATUS: 'WATCH_HOOK_ADD_EDIT_STATUS',
  CANCEL_WATCH_HOOK_ADD_EDIT_STATUS: 'CANCEL_WATCH_HOOK_ADD_EDIT_STATUS',
  REMOVE_HOOK_REQUEST: 'REMOVE_HOOK_REQUEST',
  REMOVE_HOOK_SUCCESS: 'REMOVE_HOOK_SUCCESS',
  REMOVE_HOOK_FAILURE: 'REMOVE_HOOK_FAILURE',
};

const updateCurrentPlanStatus = (currentPlanStatus: ICurrentPlanStatus) => ({
  type: PlanActionTypes.UPDATE_CURRENT_PLAN_STATUS,
  currentPlanStatus,
});

const updatePlans = (updatedPlans: IMigPlan[]) => ({
  type: PlanActionTypes.UPDATE_PLANS,
  updatedPlans,
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
  err,
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

const namespaceFetchRequest = (clusterName: string) => ({
  type: PlanActionTypes.NAMESPACE_FETCH_REQUEST,
  clusterName,
});

const namespaceFetchSuccess = (sourceClusterNamespaces: any[]) => ({
  type: PlanActionTypes.NAMESPACE_FETCH_SUCCESS,
  sourceClusterNamespaces,
});

const namespaceFetchFailure = (err) => ({
  type: PlanActionTypes.NAMESPACE_FETCH_FAILURE,
  err,
});

const pvUpdateRequest = (isRerunPVDiscovery) => ({
  type: PlanActionTypes.PV_UPDATE_REQUEST,
  isRerunPVDiscovery,
});

const pvUpdateSuccess = () => ({
  type: PlanActionTypes.PV_UPDATE_SUCCESS,
});

const pvUpdatePollStop = () => ({
  type: PlanActionTypes.PV_UPDATE_POLL_STOP,
});

const validatePlanPollStart = (params) => ({
  type: PlanActionTypes.VALIDATE_PLAN_POLL_START,
  params,
});

const validatePlanPollStop = () => ({
  type: PlanActionTypes.VALIDATE_PLAN_POLL_STOP,
});

const validatePlanRequest = (planValues) => ({
  type: PlanActionTypes.VALIDATE_PLAN_REQUEST,
  planValues,
});

const validatePlanSuccess = () => ({
  type: PlanActionTypes.VALIDATE_PLAN_SUCCESS,
});

const validatePlanFailure = (error) => ({
  type: PlanActionTypes.VALIDATE_PLAN_FAILURE,
  error,
});
const planUpdateRequest = (planValues, isRerunPVDiscovery?) => ({
  type: PlanActionTypes.PLAN_UPDATE_REQUEST,
  planValues,
  isRerunPVDiscovery,
});

const planUpdateSuccess = () => ({
  type: PlanActionTypes.PLAN_UPDATE_SUCCESS,
});

const planUpdateFailure = (error) => ({
  type: PlanActionTypes.PLAN_UPDATE_FAILURE,
  error,
});

const addPlanRequest = (migPlan: any) => ({
  type: PlanActionTypes.ADD_PLAN_REQUEST,
  migPlan,
});

const addPlanSuccess = (newPlan: IMigPlan) => ({
  type: PlanActionTypes.ADD_PLAN_SUCCESS,
  newPlan,
});

const addPlanFailure = (error) => ({
  type: PlanActionTypes.ADD_PLAN_FAILURE,
  error,
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

const migrationCancelRequest = (migrationName: string) => ({
  type: PlanActionTypes.MIGRATION_CANCEL_REQUEST,
  migrationName,
});

const migrationCancelSuccess = (migrationName: string) => ({
  type: PlanActionTypes.MIGRATION_CANCEL_SUCCESS,
  migrationName,
});

const migrationCancelFailure = (err, migrationName: string) => ({
  type: PlanActionTypes.MIGRATION_CANCEL_FAILURE,
  err,
  migrationName,
});

const planCloseAndDeleteSuccess = (planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_AND_DELETE_SUCCESS,
  planName,
});

const planCloseAndDeleteFailure = (err, planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_AND_DELETE_FAILURE,
  err,
  planName,
});

const planCloseSuccess = (planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_SUCCESS,
  planName,
});

const planCloseFailure = (err, planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_FAILURE,
  err,
  planName,
});

const getPVResourcesRequest = (pvList: any, clusterName: string) => ({
  type: PlanActionTypes.GET_PV_RESOURCES_REQUEST,
  pvList,
  clusterName,
});

const getPVResourcesSuccess = (pvResources) => ({
  type: PlanActionTypes.GET_PV_RESOURCES_SUCCESS,
  pvResources,
});

const getPVResourcesFailure = (error) => ({
  type: PlanActionTypes.GET_PV_RESOURCES_FAILURE,
  error,
});

const startPlanStatusPolling = (planName: string) => ({
  type: PlanActionTypes.PLAN_STATUS_POLL_START,
  planName,
});

const stopPlanStatusPolling = (planName: string) => ({
  type: PlanActionTypes.PLAN_STATUS_POLL_STOP,
  planName,
});

const startStagePolling = (params?: any) => ({
  type: PlanActionTypes.STAGE_POLL_START,
  params,
});

const stopStagePolling = () => ({
  type: PlanActionTypes.STAGE_POLL_STOP,
});

const startMigrationPolling = (params?: any) => ({
  type: PlanActionTypes.MIGRATION_POLL_START,
  params,
});

const stopMigrationPolling = () => ({
  type: PlanActionTypes.MIGRATION_POLL_STOP,
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
  currentPlan,
});

const runMigrationRequest = (plan, disableQuiesce) => ({
  type: PlanActionTypes.RUN_MIGRATION_REQUEST,
  plan,
  disableQuiesce,
});

const runStageRequest = (plan) => ({
  type: PlanActionTypes.RUN_STAGE_REQUEST,
  plan,
});

/*
Hook action definitions
*/

const addHookRequest = (migHook: any) => ({
  type: PlanActionTypes.ADD_HOOK_REQUEST,
  migHook,
});

const addHookSuccess = (newHook: IMigHook) => ({
  type: PlanActionTypes.ADD_HOOK_SUCCESS,
  newHook,
});

const addHookFailure = (error) => ({
  type: PlanActionTypes.ADD_HOOK_FAILURE,
  error,
});

const hookFetchRequest = (currentPlanHooks) => ({
  type: PlanActionTypes.HOOK_FETCH_REQUEST,
  currentPlanHooks,
});

const hookFetchSuccess = (migHookList: IMigHook[]) => ({
  type: PlanActionTypes.HOOK_FETCH_SUCCESS,
  migHookList,
});

const hookFetchFailure = () => ({
  type: PlanActionTypes.HOOK_FETCH_FAILURE,
});

const setHookAddEditStatus = (status: IAddEditStatus) => ({
  type: PlanActionTypes.SET_HOOK_ADD_EDIT_STATUS,
  status,
});

const watchHookAddEditStatus = (hookName: string) => ({
  type: PlanActionTypes.WATCH_HOOK_ADD_EDIT_STATUS,
  hookName,
});

const cancelWatchHookAddEditStatus = () => ({
  type: PlanActionTypes.CANCEL_WATCH_HOOK_ADD_EDIT_STATUS,
});

const removeHookRequest = (name, migrationStep) => ({
  type: PlanActionTypes.REMOVE_HOOK_REQUEST,
  name,
  migrationStep,
});

const removeHookSuccess = (name) => ({
  type: PlanActionTypes.REMOVE_HOOK_SUCCESS,
  name,
});

const removeHookFailure = (err) => ({
  type: PlanActionTypes.REMOVE_HOOK_FAILURE,
  err,
});

const updateHookRequest = (migHook: any) => ({
  type: PlanActionTypes.UPDATE_HOOK_REQUEST,
  migHook,
});

const updateHookFailure = () => ({
  type: PlanActionTypes.UPDATE_HOOK_FAILURE,
});

const updateHookSuccess = () => ({
  type: PlanActionTypes.UPDATE_HOOK_SUCCESS,
});

export const PlanActions = {
  runMigrationRequest,
  runStageRequest,
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
  pvUpdatePollStop,
  planUpdateRequest,
  planUpdateSuccess,
  planUpdateFailure,
  validatePlanRequest,
  validatePlanSuccess,
  validatePlanFailure,
  validatePlanPollStart,
  validatePlanPollStop,
  addPlanRequest,
  initStage,
  initMigration,
  migrationCancelRequest,
  migrationCancelSuccess,
  migrationCancelFailure,
  planCloseAndDeleteRequest,
  planCloseAndDeleteSuccess,
  planCloseAndDeleteFailure,
  planCloseSuccess,
  planCloseFailure,
  startPlanStatusPolling,
  stopPlanStatusPolling,
  getPVResourcesRequest,
  getPVResourcesSuccess,
  getPVResourcesFailure,
  startPlanPolling,
  stopPlanPolling,
  resetCurrentPlan,
  setCurrentPlan,
  startStagePolling,
  stopStagePolling,
  startMigrationPolling,
  stopMigrationPolling,
  /*
  Hook exports
  */
  updateHookFailure,
  updateHookRequest,
  updateHookSuccess,
  addHookFailure,
  addHookRequest,
  addHookSuccess,
  hookFetchFailure,
  hookFetchRequest,
  hookFetchSuccess,
  setHookAddEditStatus,
  watchHookAddEditStatus,
  cancelWatchHookAddEditStatus,
  removeHookFailure,
  removeHookRequest,
  removeHookSuccess,
};
