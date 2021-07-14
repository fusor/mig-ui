import { IPlanLogSources } from '@konveyor/lib-ui';

export const LogActionTypes = {
  REPORT_FETCH_REQUEST: 'REPORT_FETCH_REQUEST',
  REPORT_FETCH_SUCCESS: 'REPORT_FETCH_SUCCESS',
  REPORT_FETCH_FAILURE: 'REPORT_FETCH_FAILURE',
  LOG_FETCH_REQUEST: 'LOG_FETCH_REQUEST',
  LOG_FETCH_SUCCESS: 'LOG_FETCH_SUCCESS',
  LOG_FETCH_FAILURE: 'LOG_FETCH_FAILURE',
  CREATE_LOG_ARCHIVE: 'CREATE_LOG_ARCHIVE',
  REQUEST_DOWNLOAD_LOG: 'REQUEST_DOWNLOAD_LOG',
  REQUEST_DOWNLOAD_ALL: 'REQUEST_DOWNLOAD_ALL',
};

const reportFetchRequest = (planName: string) => ({
  type: LogActionTypes.REPORT_FETCH_REQUEST,
  planName,
});

const reportFetchSuccess = (report: IPlanLogSources) => ({
  type: LogActionTypes.REPORT_FETCH_SUCCESS,
  report,
});

const reportFetchFailure = (error: string) => ({
  type: LogActionTypes.REPORT_FETCH_FAILURE,
  error,
});

const logFetchRequest = (logPath: string) => ({
  type: LogActionTypes.LOG_FETCH_REQUEST,
  logPath,
});

const logsFetchSuccess = (log: any[]) => ({
  type: LogActionTypes.LOG_FETCH_SUCCESS,
  log,
});

const logsFetchFailure = (error: string) => ({
  type: LogActionTypes.LOG_FETCH_FAILURE,
  error,
});

const createLogArchive = (url: string) => ({
  type: LogActionTypes.CREATE_LOG_ARCHIVE,
  url,
});

const requestDownloadLog = (logPath: string) => ({
  type: LogActionTypes.REQUEST_DOWNLOAD_LOG,
  logPath,
});

const requestDownloadAll = (report: IPlanLogSources) => ({
  type: LogActionTypes.REQUEST_DOWNLOAD_ALL,
  report,
});

export const LogActions = {
  logFetchRequest,
  logsFetchSuccess,
  logsFetchFailure,
  reportFetchRequest,
  reportFetchSuccess,
  reportFetchFailure,
  requestDownloadLog,
  requestDownloadAll,
  createLogArchive,
};
