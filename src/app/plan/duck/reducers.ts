import { Types } from './actions';
import { createReducer } from 'reduxsauce';
import moment from 'moment';

export const INITIAL_STATE = {
  isPVError: false,
  isFetchingPVList: false,
  isError: false,
  isFetching: false,
  migPlanList: [],
  planStateMap: [],
  planSearchText: '',
  sourceClusterNamespaces: [],
  isStaging: false,
  isMigrating: false,
};
const sortPlans = planList =>
  planList.sort((left, right) => {
    return moment
      .utc(right.MigPlan.metadata.creationTimestamp)
      .diff(moment.utc(left.MigPlan.metadata.creationTimestamp));
  });
const sortMigrations = migList =>
  migList.sort((left, right) => {
    return moment
      .utc(right.metadata.creationTimestamp)
      .diff(moment.utc(left.metadata.creationTimestamp));
  });

export const migPlanFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};

export const migPlanFetchSuccess = (state = INITIAL_STATE, action) => {
  const sortedList = sortPlans(action.migPlanList);
  return { ...state, migPlanList: sortedList, isFetching: false };
};
export const migPlanFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};
export const pvFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isPVError: false, isFetchingPVList: true };
};
export const pvFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isPVError: true, isFetchingPVList: false };
};
export const pvFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, isPVError: false, isFetchingPVList: false };
};

export const addPlanSuccess = (state = INITIAL_STATE, action) => {
  const newPlanState = {
    migrations: [],
    persistentVolumes: [],
    status: {
      state: 'Not Started',
      progress: 0,
    },
  };

  const newPlan = {
    MigPlan: action.newPlan,
    Migrations: [],
    planState: newPlanState,
  };

  return {
    ...state,
    migPlanList: [...state.migPlanList, newPlan],
  };
};

export const removePlanSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const sourceClusterNamespacesFetchSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    sourceClusterNamespaces: action.sourceClusterNamespaces,
  };
};

export const updatePlanProgress = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.planName === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.planName !== action.planName);

  updatedPlan.status.progress = action.progress;
  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
  };
};

export const updatePlan = (state = INITIAL_STATE, action) => {
  const updatedPlanList = state.migPlanList.map(p => {
    if (p.MigPlan.metadata.name === action.updatedPlan.metadata.name) {
      return {
        MigPlan: action.updatedPlan,
        Migrations: [],
        planState: p.planState,
      };
    } else {
      return p;
    }
  });
  const sortedList = sortPlans(updatedPlanList);

  return {
    ...state,
    migPlanList: sortedList,
  };
};

export const updatePlanMigrations = (state = INITIAL_STATE, action) => {
  const updatedPlanList = state.migPlanList.map(p => {
    if (p.MigPlan.metadata.name === action.updatedPlan.MigPlan.metadata.name) {
      //filter migrations
      action.updatedPlan.Migrations = sortMigrations(action.updatedPlan.Migrations);
      return action.updatedPlan;
    } else {
      return p;
    }
  });

  const sortedList = sortPlans(updatedPlanList);

  return {
    ...state,
    migPlanList: sortedList,
  };
};

export const updatePlans = (state = INITIAL_STATE, action) => {
  const updatedPlanList = action.updatedPlans.map(p => {
    //filter migrations
    p.Migrations = sortMigrations(p.Migrations);
    return p;
  });

  const sortedList = sortPlans(updatedPlanList);

  return {
    ...state,
    migPlanList: sortedList,
  };
};

export const initStage = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.planName === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.planName !== action.planName);

  updatedPlan.status = {
    state: 'Staging',
    progress: 0,
  };

  updatedPlan.migrations = [...updatedPlan.migrations, 'stage'];

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isStaging: true,
  };
};

export const stagingSuccess = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.planName === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.planName !== action.planName);

  updatedPlan.status = {
    state: 'Staged Successfully',
    progress: 0,
  };
  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isStaging: false,
  };
};

export const initMigration = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  updatedPlan.planState.status = {
    state: 'Migrating',
    progress: 0,
  };
  const newMigObject = {
    type: 'Migrate',
    start: moment().format(),
    end: moment().format(),
    moved: 0,
    copied: 0,
    status: 'Complete',
  };
  const updatedMigrationsList = [...updatedPlan.planState.migrations, newMigObject];
  const updatedMigrations = sortMigrations(updatedMigrationsList);
  updatedPlan.planState.migrations = updatedMigrations;

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isMigrating: true,
  };
};

export const migrationSuccess = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  updatedPlan.planState.status = {
    state: 'Migrated Successfully',
    progress: 0,
  };
  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isMigrating: false,
  };
};

export const HANDLERS = {
  [Types.MIG_PLAN_FETCH_REQUEST]: migPlanFetchRequest,
  [Types.MIG_PLAN_FETCH_SUCCESS]: migPlanFetchSuccess,
  [Types.MIG_PLAN_FETCH_FAILURE]: migPlanFetchFailure,
  [Types.ADD_PLAN_SUCCESS]: addPlanSuccess,
  [Types.REMOVE_PLAN_SUCCESS]: removePlanSuccess,
  [Types.SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS]: sourceClusterNamespacesFetchSuccess,
  [Types.UPDATE_PLAN_PROGRESS]: updatePlanProgress,
  [Types.INIT_STAGE]: initStage,
  [Types.STAGING_SUCCESS]: stagingSuccess,
  [Types.INIT_MIGRATION]: initMigration,
  [Types.MIGRATION_SUCCESS]: migrationSuccess,
  [Types.UPDATE_PLAN]: updatePlan,
  [Types.UPDATE_PLAN_MIGRATIONS]: updatePlanMigrations,
  [Types.UPDATE_PLANS]: updatePlans,
  [Types.PV_FETCH_SUCCESS]: pvFetchSuccess,
  [Types.PV_FETCH_FAILURE]: pvFetchFailure,
  [Types.PV_FETCH_REQUEST]: pvFetchRequest,
};

export default createReducer(INITIAL_STATE, HANDLERS);
