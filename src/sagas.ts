import { all } from 'redux-saga/effects';
import commonSagas from './app/common/duck/sagas';
import planSagas from './app/plan/duck/sagas';
import logSagas from './app/logs/duck/sagas';
import clusterSagas from './app/cluster/duck/sagas';
import storageSagas from './app/storage/duck/sagas';

export default function* rootSaga() {
  yield all([
    commonSagas.watchPlanPolling(),
    commonSagas.watchStatusPolling(),
    commonSagas.watchClustersPolling(),
    commonSagas.watchStoragePolling(),
    commonSagas.watchAlerts(),
    planSagas.watchPlanUpdate(),
    planSagas.watchPlanCloseAndDelete(),
    planSagas.watchPlanClose(),
    planSagas.watchPlanStatus(),
    planSagas.watchGetPVResourcesRequest(),
    planSagas.watchNamespaceFetchRequest(),
    planSagas.watchPVUpdate(),
    logSagas.watchReportPolling(),
    logSagas.watchLogsPolling(),
    logSagas.watchLogDownload(),
    logSagas.watchLogsDownload(),
    clusterSagas.watchAddClusterRequest(),
    clusterSagas.watchUpdateClusterRequest(),
    clusterSagas.watchClusterAddEditStatus(),
    storageSagas.watchAddStorageRequest(),
    storageSagas.watchStorageAddEditStatus(),
    storageSagas.watchUpdateStorageRequest(),
  ]);
}
