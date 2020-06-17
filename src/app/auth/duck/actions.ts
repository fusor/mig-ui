interface ILoginParams {
  token?: string;
  username?: string;
  access_token?: string;
  expires_in?: number;
  expiry_time?: number;
  login_time?: number;
  scope?: string;
  token_type?: string;
}

export const AuthActionTypes = {
  FETCH_TOKEN: 'FETCH_TOKEN',
  LOGOUT_USER_REQUEST: 'LOGOUT_USER_REQUEST',
  INIT_FROM_STORAGE: 'INIT_FROM_STORAGE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SET_OAUTH_META: 'SET_OAUTH_META',
  SET_IS_ADMIN: 'SET_IS_ADMIN',
  FETCH_OAUTH_META: 'FETCH_OAUTH_META',
  FETCH_IS_ADMIN: 'FETCH_IS_ADMIN',
  CERT_ERROR_OCCURRED: 'CERT_ERROR_OCCURRED',
};

const loginSuccess = (user: ILoginParams) => ({
  type: AuthActionTypes.LOGIN_SUCCESS,
  user,
});

const loginFailure = () => ({
  type: AuthActionTypes.LOGIN_FAILURE,
});

const logoutUserRequest = () => ({
  type: AuthActionTypes.LOGOUT_USER_REQUEST,
});

const fetchOauthMeta = (clusterApi: string) => ({
  type: AuthActionTypes.FETCH_OAUTH_META,
  clusterApi,
});

const fetchIsAdmin = () => ({
  type: AuthActionTypes.FETCH_IS_ADMIN,
});

const setOauthMeta = (oauthMeta: string) => ({
  type: AuthActionTypes.SET_OAUTH_META,
  oauthMeta,
});

const initFromStorage = () => ({
  type: AuthActionTypes.INIT_FROM_STORAGE,
});

const certErrorOccurred = (failedUrl: string) => ({
  type: AuthActionTypes.CERT_ERROR_OCCURRED,
  failedUrl,
});

const fetchToken = (oauthClient: any, coreRedirect: any) => ({
  type: AuthActionTypes.FETCH_TOKEN,
  oauthClient,
  coreRedirect,
});

const setIsAdmin = (hasAdmin: boolean) => ({
  type: AuthActionTypes.SET_IS_ADMIN,
  hasAdmin,
});

export const AuthActions = {
  logoutUserRequest,
  initFromStorage,
  loginSuccess,
  loginFailure,
  setOauthMeta,
  fetchOauthMeta,
  fetchToken,
  certErrorOccurred,
  setIsAdmin,
  fetchIsAdmin,
};
