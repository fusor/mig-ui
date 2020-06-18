import axios from 'axios';
import { select, takeLatest, race, call, delay, take, put } from 'redux-saga/effects';
import { AuthActions, AuthActionTypes } from './actions';
import { AlertActions } from '../../common/duck/actions';

import { push } from 'connected-react-router';
import moment from 'moment';

import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';

const LS_KEY_CURRENT_USER = 'currentUser';

export function* fetchOauthMeta(action) {
  const oauthMetaUrl = `${action.clusterApi}/.well-known/oauth-authorization-server`;
  try {
    const res = yield axios.get(oauthMetaUrl);
    yield put(AuthActions.setOauthMeta(res.data));
  } catch (err) {
    if (isSelfSignedCertError(err)) {
      yield put(AuthActions.certErrorOccurred(oauthMetaUrl));
      yield put(push('/cert-error'));
      return;
    }
    yield put(AuthActions.loginFailure());
    yield put(AlertActions.alertErrorTimeout(err));
  }
}

export function* fetchToken(action) {
  const { oauthClient, coreRedirect } = action;
  const result = yield oauthClient.code.getToken(coreRedirect);
  const user = result.data;
  const currentUnixTime = moment().unix();
  const expiryUnixTime = currentUnixTime + user.expires_in;
  user.login_time = currentUnixTime;
  user.expiry_time = expiryUnixTime;
  localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
  yield put(AuthActions.loginSuccess(user));
  yield put(push('/'));
}

export function* initFromStorage(): any {
  const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
  if (currentUser) {
    yield put(AuthActions.loginSuccess(JSON.parse(currentUser)));
    yield put(AuthActions.fetchIsAdmin());
  }
}

export function* fetchIsAdmin(): any {
  const state = yield select();
  const migMeta = state.migMeta;
  const { access_token } = state.auth.user;
  const isAdminUrl = `${migMeta.discoveryApi}/namespaces/openshift-migration/auth`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  };

  let isAdminRes;
  try {
    isAdminRes = yield axios.get(isAdminUrl, config);
  } catch (err) {
    if (isSelfSignedCertError(err)) {
      yield put(AuthActions.certErrorOccurred(isAdminUrl));
      yield put(push('/cert-error'));
      return;
    }
  }
  if (isAdminRes.data) {
    yield put(AuthActions.setIsAdmin(isAdminRes.data.hasAdmin));
  }
}

export function* logoutUser() {
  localStorage.removeItem(LS_KEY_CURRENT_USER);
  yield put(push('/login?action=refresh'));
}

function* watchAuthEvents() {
  yield takeLatest(AuthActionTypes.LOGOUT_USER_REQUEST, logoutUser);
  yield takeLatest(AuthActionTypes.INIT_FROM_STORAGE, initFromStorage);
  yield takeLatest(AuthActionTypes.FETCH_TOKEN, fetchToken);
  yield takeLatest(AuthActionTypes.FETCH_OAUTH_META, fetchOauthMeta);
  yield takeLatest(AuthActionTypes.FETCH_IS_ADMIN, fetchIsAdmin);
}

export default {
  watchAuthEvents,
};
