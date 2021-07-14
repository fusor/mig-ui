import { put, all, take } from 'redux-saga/effects';
import debugSagas from './app/debug/duck/sagas';
import commonSagas from './app/common/duck/sagas';
import authSagas from './app/auth/duck/sagas';
import planSagas from './app/plan/duck/sagas';
import logSagas from './app/logs/duck/sagas';
import clusterSagas from './app/cluster/duck/sagas';
import storageSagas from './app/storage/duck/sagas';
import { setTokenExpiryHandler } from '@konveyor/lib-ui';

import { ClusterActions } from './app/cluster/duck/actions';
import { initFromStorage, initMigMeta } from './app/auth/duck/slice';

declare global {
  interface Window {
    _mig_meta: string;
  }
}

export default function* rootSaga() {
  function* appStarted() {
    // Some amount of meta data is delivered to the app by the server

    const migMeta = JSON.parse(atob(window['_mig_meta']));

    // Load the meta into the redux tree if it was found on the window
    // Will only be present in remote-dev and production scenarios where
    // oauth meta must be loaded
    if (migMeta) {
      yield put(initMigMeta(migMeta));
      yield put(initFromStorage());
      // Early prompt for discovery service cert acceptance if it hasn't already been accepted
      yield put(ClusterActions.initializeDiscoveryCert());
    }

    // Configure token expiry behavior
    setTokenExpiryHandler(() => {
      const LS_KEY_CURRENT_USER = 'currentUser';
      localStorage.removeItem(LS_KEY_CURRENT_USER);
      window.location.href = '/login';
    });
  }

  yield all([
    appStarted(),
    debugSagas.watchDebugObjectFetchRequest(),
    debugSagas.watchDebugTreeFetchRequest(),
    debugSagas.watchDebugRefsFetchRequest(),
    debugSagas.watchDebugPolling(),
    commonSagas.watchPlanPolling(),
    commonSagas.watchClustersPolling(),
    commonSagas.watchStoragePolling(),
    commonSagas.watchHookPolling(),
    commonSagas.watchAlerts(),
    planSagas.watchStagePolling(),
    planSagas.watchMigrationPolling(),
    planSagas.watchRollbackPolling(),
    planSagas.watchAddPlanRequest(),
    planSagas.watchAddAnalyticRequest(),
    planSagas.watchDeleteAnalyticRequest(),
    planSagas.watchRefreshAnalyticRequest(),
    planSagas.watchRunMigrationRequest(),
    planSagas.watchRunStageRequest(),
    planSagas.watchRunRollbackRequest(),
    planSagas.watchPvDiscoveryRequest(),
    planSagas.watchPVUpdatePolling(),
    planSagas.watchMigrationCancel(),
    planSagas.watchPlanCloseAndDelete(),
    planSagas.watchPlanStatus(),
    planSagas.watchGetPVResourcesRequest(),
    planSagas.watchNamespaceFetchRequest(),
    planSagas.watchAddHookRequest(),
    planSagas.watchFetchPlanHooksRequest(),
    planSagas.watchRemoveHookFromPlanRequest(),
    planSagas.watchRemoveHookRequest(),
    planSagas.watchUpdateHookRequest(),
    planSagas.watchValidatePlanRequest(),
    planSagas.watchValidatePlanPolling(),
    planSagas.watchAssociateHookToPlan(),
    planSagas.watchUpdatePlanHookList(),
    logSagas.watchReportPolling(),
    logSagas.watchLogsPolling(),
    logSagas.watchLogDownload(),
    logSagas.watchLogsDownload(),
    logSagas.watchClusterPodFetchRequest(),
    clusterSagas.watchRemoveClusterRequest(),
    clusterSagas.watchAddClusterRequest(),
    clusterSagas.watchUpdateClusterRequest(),
    clusterSagas.watchClusterAddEditStatus(),
    clusterSagas.watchInitDiscoveryCert(),
    storageSagas.watchRemoveStorageRequest(),
    storageSagas.watchAddStorageRequest(),
    storageSagas.watchStorageAddEditStatus(),
    storageSagas.watchUpdateStorageRequest(),
    authSagas.watchAuthEvents(),
  ]);
}
