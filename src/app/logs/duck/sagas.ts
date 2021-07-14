import { select, put, takeEvery, all, StrictEffect } from 'redux-saga/effects';
import { flatten } from 'lodash';
import {
  PlanPodReportDiscovery,
  ClusterKind,
  IPlanLogSources,
  IPlanReport,
  IPodCollectorDiscoveryResource,
  PodCollectorDiscoveryResource,
} from '../../../client/resources/discovery';
import JSZip from 'jszip';
import utils from '../../common/duck/utils';
import { handleCertError } from './utils';
import { alertErrorTimeout } from '../../common/duck/slice';
import { DefaultRootState } from '../../../configureStore';
import {
  clusterPodFetchFailure,
  clusterPodFetchRequest,
  clusterPodFetchSuccess,
  createLogArchive,
  IClusterLogPodObject,
  logsFetchFailure,
  logsFetchRequest,
  logsFetchSuccess,
  reportFetchFailure,
  reportFetchRequest,
  reportFetchSuccess,
  requestDownloadAll,
  requestDownloadLog,
} from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { planSelectors } from '../../plan/duck';
import { ICluster, IMigCluster } from '../../cluster/duck/types';
import { ClientFactory } from '@konveyor/lib-ui';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { DiscoveryFactory } from '../../../client/discovery_factory';

function* getState(): Generator<StrictEffect, DefaultRootState, DefaultRootState> {
  const res: DefaultRootState = yield select();
  return res;
}

const clusterIndex = 4;
const logIndex = 8;

function* downloadLog(action: any): Generator<any, any, any> {
  const state = yield* getState();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );
  const logPath: string = action.payload;
  try {
    const archive = new JSZip();
    const log = yield discoveryClient.getRaw(logPath);
    const fullPath = logPath.split(/\//);
    const clusterName = fullPath[clusterIndex];
    const logName = fullPath[logIndex];
    const containerName = logPath.split(/container=/)[1];
    archive.file(`${clusterName}-${logName}-${containerName}.log`, log.data.join('\n'));
    const content = yield archive.generateAsync({ type: 'blob' });
    const file = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(file);
    yield put(createLogArchive(url));
  } catch (err) {
    yield put(alertErrorTimeout(err.message));
  }
}

function* downloadLogs(action: any): Generator<any, any, any> {
  const state = yield* getState();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );
  const report: IPlanLogSources = action.payload;
  try {
    const archive = new JSZip();
    let logPaths: any = flatten(
      Object.values(ClusterKind).map((src) =>
        report[src].map((pod) => pod.containers.map((container) => container.log))
      )
    );
    logPaths = flatten(logPaths.filter((log: any) => log.length > 0));
    const logs = yield all(logPaths.map((log: string) => discoveryClient.getRaw(log)));

    logs.map((log: any, index: number) => {
      const fullPath = logPaths[index].split(/\//);
      const clusterName = fullPath[clusterIndex];
      const logName = fullPath[logIndex];
      const containerName = logPaths[index].split(/container=/)[1];
      archive.file(`${clusterName}-${logName}-${containerName}.log`, log.data.join('\n'));
    });

    const content = yield archive.generateAsync({ type: 'blob' });
    const file = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(file);
    yield put(createLogArchive(url));
  } catch (err) {
    yield put(alertErrorTimeout(err.message));
  }
}

function* extractLogs(action: any): Generator<any, any, any> {
  const state = yield* getState();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );
  const logPath = action.payload;
  try {
    const log = yield discoveryClient.getRaw(logPath);
    yield put(logsFetchSuccess(log.data));
  } catch (err) {
    if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(logsFetchFailure(err));
  }
}

function* collectReport(action: PayloadAction<string>) {
  const planName = action.payload;
  const state: DefaultRootState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );
  const planPodReportDiscovery = new PlanPodReportDiscovery(planName);
  try {
    const planReport: IPlanReport = yield planPodReportDiscovery.get(discoveryClient);

    delete planReport.name;
    delete planReport.namespace;
    yield put(reportFetchSuccess(planReport));
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(alertErrorTimeout('Timed out while fetching plan report'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(reportFetchFailure(err));
  }
}

function* fetchPodNames(action: PayloadAction<string>): Generator<any, any, any> {
  const state: DefaultRootState = yield select();
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    state.auth.migMeta.discoveryApi
  );

  const planName = action.payload;
  const currentPlan = state.plan.migPlanList.find(
    (plan) => plan.MigPlan.metadata.name === planName
  );
  const nonHostClusters = state.cluster.clusterList.filter(
    (c: ICluster) => !c.MigCluster.spec.isHostCluster
  );

  const isSrcNonHost = nonHostClusters.some(
    (nonHostCluster) =>
      nonHostCluster.MigCluster.metadata.name === currentPlan.MigPlan.spec.srcMigClusterRef.name
  );
  const isDestNonHost = nonHostClusters.some(
    (nonHostCluster) =>
      nonHostCluster.MigCluster.metadata.name === currentPlan.MigPlan.spec.destMigClusterRef.name
  );

  let clusterObjForPlan;

  if (isSrcNonHost && isDestNonHost) {
    const hostCluster = state.cluster.clusterList.find(
      (c: ICluster) => c.MigCluster.spec.isHostCluster
    );
    clusterObjForPlan = {
      host: hostCluster.MigCluster.metadata.name,
      dest: currentPlan.MigPlan.spec.destMigClusterRef.name,
      src: currentPlan.MigPlan.spec.srcMigClusterRef.name,
    };
  } else {
    clusterObjForPlan = {
      dest: currentPlan.MigPlan.spec.destMigClusterRef.name,
      src: currentPlan.MigPlan.spec.srcMigClusterRef.name,
    };
  }

  const srcPodCollectorDiscoveryResource: IPodCollectorDiscoveryResource =
    new PodCollectorDiscoveryResource(clusterObjForPlan.src);
  const destPodCollectorDiscoveryResource: IPodCollectorDiscoveryResource =
    new PodCollectorDiscoveryResource(clusterObjForPlan.dest);
  const hostPodCollectorDiscoveryResource: IPodCollectorDiscoveryResource =
    new PodCollectorDiscoveryResource(clusterObjForPlan?.host);

  try {
    const srcPodList = yield discoveryClient.get(srcPodCollectorDiscoveryResource);
    const destPodList = yield discoveryClient.get(destPodCollectorDiscoveryResource);
    const srcLogPod = srcPodList?.data?.resources.find((resource: any) =>
      resource.name.includes('migration-log-reader-')
    );
    const destLogPod = destPodList?.data?.resources.find((resource: any) =>
      resource.name.includes('migration-log-reader-')
    );
    if (isSrcNonHost && isDestNonHost) {
      const hostPodList = yield discoveryClient.get(hostPodCollectorDiscoveryResource);
      const hostLogPod = hostPodList?.data?.resources.find((resource: any) =>
        resource.name.includes('migration-log-reader-')
      );
      const logPodObject: IClusterLogPodObject = {
        src: srcLogPod,
        dest: destLogPod,
        host: hostLogPod,
      };

      yield put(clusterPodFetchSuccess(logPodObject));
    } else {
      const logPodObject: IClusterLogPodObject = {
        src: srcLogPod,
        dest: destLogPod,
        host: !isDestNonHost ? destLogPod : srcLogPod,
      };

      yield put(clusterPodFetchSuccess(logPodObject));
    }
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(alertErrorTimeout('Timed out while fetching cluster pod report'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(clusterPodFetchFailure(err));
  }
}

function* watchLogsPolling() {
  yield takeEvery(logsFetchRequest, extractLogs);
}

function* watchLogsDownload() {
  yield takeEvery(requestDownloadAll, downloadLogs);
}

function* watchLogDownload() {
  yield takeEvery(requestDownloadLog, downloadLog);
}

function* watchReportPolling() {
  yield takeEvery(reportFetchRequest, collectReport);
}

function* watchClusterPodFetchRequest() {
  yield takeEvery(clusterPodFetchRequest, fetchPodNames);
}

export default {
  watchLogsDownload,
  watchLogDownload,
  watchLogsPolling,
  watchReportPolling,
  watchClusterPodFetchRequest,
};
