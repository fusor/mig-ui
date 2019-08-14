import { IMigPlan } from '../../../client/resources/conversions';

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
  UPDATE_PLAN: 'UPDATE_PLAN',
  UPDATE_PLAN_MIGRATIONS: 'UPDATE_PLAN_MIGRATIONS',
  MIG_PLAN_FETCH_REQUEST: 'MIG_PLAN_FETCH_REQUEST',
  MIG_PLAN_FETCH_SUCCESS: 'MIG_PLAN_FETCH_SUCCESS',
  MIG_PLAN_FETCH_FAILURE: 'MIG_PLAN_FETCH_FAILURE',
  NAMESPACE_FETCH_REQUEST: 'NAMESPACE_FETCH_REQUEST',
  NAMESPACE_FETCH_SUCCESS: 'NAMESPACE_FETCH_SUCCESS',
  NAMESPACE_FETCH_FAILURE: 'NAMESPACE_FETCH_FAILURE',
  PV_FETCH_REQUEST: 'PV_FETCH_REQUEST',
  PV_FETCH_FAILURE: 'PV_FETCH_FAILURE',
  PV_FETCH_SUCCESS: 'PV_FETCH_SUCCESS',
  SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS: 'SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS',
  START_PV_POLLING: 'START_PV_POLLING',
  STOP_PV_POLLING: 'STOP_PV_POLLING',
  ADD_PLAN_REQUEST: 'ADD_PLAN_REQUEST',
  PLAN_UPDATE_REQUEST: 'PLAN_UPDATE_REQUEST',
  PLAN_RESULTS_REQUEST: 'PLAN_RESULTS_REQUEST',
  INIT_STAGE: 'INIT_STAGE',
  INIT_MIGRATION: 'INIT_MIGRATION',
  PLAN_CLOSE_AND_DELETE_REQUEST: 'PLAN_CLOSE_AND_DELETE_REQUEST',
  PLAN_CLOSE_AND_DELETE_SUCCESS: 'PLAN_CLOSE_AND_DELETE_SUCCESS',
  PLAN_CLOSE_AND_DELETE_FAILURE: 'PLAN_CLOSE_AND_DELETE_SUCCESS',
  PLAN_CLOSE_REQUEST: 'PLAN_CLOSE_REQUEST',
  PLAN_CLOSE_SUCCESS: 'PLAN_CLOSE_SUCCESS',
  PLAN_CLOSE_FAILURE: 'PLAN_CLOSE_FAILURE'
};

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

const updatePlanResults = (results: string) => ({
  type: PlanActionTypes.UPDATE_PLAN_RESULTS,
  results,
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

const updatePlan = (updatedPlan: IMigPlan) => ({
  type: PlanActionTypes.UPDATE_PLAN,
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

const pvFetchRequest = () => ({
  type: PlanActionTypes.PV_FETCH_REQUEST,
});

const pvFetchFailure = () => ({
  type: PlanActionTypes.PV_FETCH_FAILURE,
});

const pvFetchSuccess = () => ({
  type: PlanActionTypes.PV_FETCH_SUCCESS,
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

const startPVPolling = (params) => ({
  type: PlanActionTypes.START_PV_POLLING,
  params,
});

const stopPVPolling = () => ({
  type: PlanActionTypes.STOP_PV_POLLING,
});

const planResultsRequest = () => ({
  type: PlanActionTypes.PLAN_RESULTS_REQUEST,
});

const planUpdateRequest = (planValues) => ({
  type: PlanActionTypes.PLAN_UPDATE_REQUEST,
  planValues,
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

const planCloseAndDeleteFailure = (planName: string) => ({
  type: PlanActionTypes.PLAN_CLOSE_AND_DELETE_FAILURE,
  planName,
});

const planCloseRequest = () => ({
  type: PlanActionTypes.PLAN_CLOSE_REQUEST,
});

const planCloseSuccess = () => ({
  type: PlanActionTypes.PLAN_CLOSE_SUCCESS,
});

const planCloseFailure = (err) => ({
  type: PlanActionTypes.PLAN_CLOSE_FAILURE,
  err
});


export const PlanActions = {
  updatePlans,
  addPlanSuccess,
  addPlanFailure,
  updatePlanResults,
  removePlanSuccess,
  updateStageProgress,
  stagingSuccess,
  stagingFailure,
  migrationSuccess,
  migrationFailure,
  updatePlan,
  updatePlanMigrations,
  migPlanFetchRequest,
  migPlanFetchSuccess,
  migPlanFetchFailure,
  pvFetchRequest,
  pvFetchFailure,
  pvFetchSuccess,
  sourceClusterNamespacesFetchSuccess,
  namespaceFetchRequest,
  namespaceFetchSuccess,
  namespaceFetchFailure,
  startPVPolling,
  stopPVPolling,
  planResultsRequest,
  planUpdateRequest,
  addPlanRequest,
  initStage,
  initMigration,
  planCloseAndDeleteRequest,
  planCloseAndDeleteSuccess,
  planCloseAndDeleteFailure,
  planCloseSuccess,
  planCloseFailure,
  planCloseRequest
};
