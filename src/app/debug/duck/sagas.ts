import { select, put, takeEvery, delay, call, race, take, StrictEffect } from 'redux-saga/effects';
import {
  debugObjectFetchFailure,
  debugObjectFetchRequest,
  debugObjectFetchSuccess,
  startDebugPolling,
  stopDebugPolling,
  treeFetchFailure,
  treeFetchRequest,
  treeFetchSuccess,
  debugRefsFetchFailure,
  debugRefsFetchRequest,
  debugRefsFetchSuccess,
} from './slice';
import { alertErrorTimeout } from '../../common/duck/slice';
import debugReducer from '.';
import { DefaultRootState } from '../../../configureStore';
import { ClientFactory } from '@konveyor/lib-ui';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import {
  DebugTreeDiscoveryResource,
  IDebugTreeResource,
} from '../../../client/resources/discovery';
import { DiscoveryFactory } from '../../../client/discovery_factory';

function* getState(): Generator<StrictEffect, DefaultRootState, DefaultRootState> {
  const res: DefaultRootState = yield select();
  return res;
}

function* fetchDebugRefs(action: any): Generator<any, any, any> {
  const state = yield* getState();
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );
  const linkRefs: Array<any> = [];
  const eachRecursive = (obj: any) => {
    for (const k in obj) {
      if (typeof obj[k] == 'object' && obj[k] !== null) {
        eachRecursive(obj[k]);
      } else {
        if (k === 'objectLink') {
          linkRefs.push({ link: obj[k], kind: obj['kind'] });
        }
      }
    }
  };
  eachRecursive(action.payload);

  const debugRefs: Array<Promise<any>> = linkRefs.map(function (linkRef) {
    return discoveryClient.getRaw(linkRef.link).then(function (value) {
      return {
        kind: linkRef.kind,
        value: value,
      };
    });
  });

  try {
    const debugRefsRes = yield Promise.all(debugRefs);
    const assembledEventLinks: Array<any> = [];
    debugRefsRes.forEach((val: any) => {
      const uid = val.value.data.object.metadata.uid;
      const assembledLink = `/namespaces/openshift-migration/events/${uid}`;
      assembledEventLinks.push(assembledLink);
    });
    const eventRefs: Array<Promise<any>> = assembledEventLinks.map(function (eventLinkRef) {
      return discoveryClient.getRaw(eventLinkRef).then(function (value) {
        return value;
      });
    });
    const eventRefsRes = yield Promise.all(eventRefs).then((result) => {
      return debugRefsRes.map((debugRef: any) => {
        const foundEvent = result.find(
          (resItem) => resItem?.data?.uid === debugRef?.value?.data?.object?.metadata?.uid
        );
        return {
          ...debugRef,
          associatedEvents: foundEvent?.data,
        };
      });
    });

    yield put(debugRefsFetchSuccess(eventRefsRes));
  } catch (err) {
    yield put(debugRefsFetchFailure(err.message));
    yield put(alertErrorTimeout(`Failed to fetch debug ref: ${err.message}`));
  }
}

function* fetchDebugObject(action: any): Generator<any, any, any> {
  const state = yield* getState();
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );

  try {
    const res = yield discoveryClient.getRaw(action.payload);
    yield put(debugObjectFetchSuccess(res.data));
  } catch (err) {
    yield put(debugObjectFetchFailure(err.message));
    yield put(alertErrorTimeout(`Failed to fetch debug tree: ${err.message}`));
  }
}

function* fetchDebugTree(action: any): Generator<any, any, any> {
  const { planName, migrationID } = action.payload;
  const state = yield* getState();
  const discoveryClient: IDiscoveryClient = DiscoveryFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    '/discovery-api'
  );
  const debugTreeResource: IDebugTreeResource = new DebugTreeDiscoveryResource(
    planName,
    migrationID
  );

  try {
    const res = yield discoveryClient.get(debugTreeResource);

    yield put(debugRefsFetchRequest(res.data));
    ////////////////
    // Fetch events for each debug Ref
    ///////////////
    yield take(debugRefsFetchSuccess);
    yield put(treeFetchSuccess(res.data));
  } catch (err) {
    yield put(treeFetchFailure(err.message));
    yield put(alertErrorTimeout(`Failed to fetch debug tree: ${err.message}`));
  }
}
function* debugPoll(action: any): Generator<any, any, any> {
  while (true) {
    try {
      yield put(treeFetchRequest(action.payload));
      yield take(treeFetchSuccess);
      yield delay(10000);
    } catch {
      yield put(stopDebugPolling);
    }
  }
}

function* watchDebugPolling(): Generator {
  while (true) {
    const data = yield take(startDebugPolling.type);
    yield race([call(debugPoll, data), take(stopDebugPolling.type)]);
  }
}
function* watchDebugTreeFetchRequest() {
  yield takeEvery(treeFetchRequest.type, fetchDebugTree);
}

function* watchDebugRefsFetchRequest() {
  yield takeEvery(debugRefsFetchRequest.type, fetchDebugRefs);
}

function* watchDebugObjectFetchRequest() {
  yield takeEvery(debugObjectFetchRequest.type, fetchDebugObject);
}

export default {
  watchDebugTreeFetchRequest,
  watchDebugObjectFetchRequest,
  watchDebugPolling,
  watchDebugRefsFetchRequest,
};
