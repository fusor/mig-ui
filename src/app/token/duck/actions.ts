import { IToken, ITokenFormValues } from './types';
import { IAddEditStatus } from '../../common/add_edit_state';

export const TokenActionTypes = {
  TOGGLE_ADD_EDIT_TOKEN_MODAL: 'TOGGLE_ADD_EDIT_TOKEN_MODAL',
  SET_ASSOCIATED_CLUSTER: 'SET_ASSOCIATED_CLUSTER',
  SET_CURRENT_TOKEN: 'SET_CURRENT_TOKEN',
  MIG_TOKEN_FETCH_REQUEST: 'MIG_TOKEN_FETCH_REQUEST',
  MIG_TOKEN_FETCH_SUCCESS: 'MIG_TOKEN_FETCH_SUCCESS',
  MIG_TOKEN_FETCH_FAILURE: 'MIG_TOKEN_FETCH_FAILURE',
  UPDATE_TOKEN_REQUEST: 'UPDATE_TOKEN_REQUEST',
  UPDATE_TOKEN_SUCCESS: 'UPDATE_TOKEN_SUCCESS',
  UPDATE_TOKEN_FAILURE: 'UPDATE_TOKEN_FAILURE',
  ADD_TOKEN_REQUEST: 'ADD_TOKEN_REQUEST',
  ADD_TOKEN_SUCCESS: 'ADD_TOKEN_SUCCESS',
  ADD_TOKEN_FAILURE: 'ADD_TOKEN_FAILURE',
  REMOVE_TOKEN_REQUEST: 'REMOVE_TOKEN_REQUEST',
  REMOVE_TOKEN_SUCCESS: 'REMOVE_TOKEN_SUCCESS',
  REMOVE_TOKEN_FAILURE: 'REMOVE_TOKEN_FAILURE',
  UPDATE_TOKENS: 'UPDATE_TOKENS',
  TOKEN_POLL_START: 'TOKEN_POLL_START',
  TOKEN_POLL_STOP: 'TOKEN_POLL_STOP',
  SET_TOKEN_ADD_EDIT_STATUS: 'SET_TOKEN_ADD_EDIT_STATUS',
  WATCH_TOKEN_ADD_EDIT_STATUS: 'WATCH_TOKEN_ADD_EDIT_STATUS',
  CANCEL_WATCH_TOKEN_ADD_EDIT_STATUS: 'CANCEL_WATCH_TOKEN_ADD_EDIT_STATUS',
};

// NATODO what can we abstract out here? Take lessons from Migration Analytics?
const addTokenRequest = (tokenValues: ITokenFormValues) => ({
  type: TokenActionTypes.ADD_TOKEN_REQUEST,
  tokenValues,
});

const addTokenSuccess = (newMigToken: IToken) => ({
  type: TokenActionTypes.ADD_TOKEN_SUCCESS,
  newMigToken,
});

const addTokenFailure = (error) => ({
  type: TokenActionTypes.ADD_TOKEN_FAILURE,
  error,
});

const updateTokens = (updatedTokens: IToken[]) => ({
  type: TokenActionTypes.UPDATE_TOKENS,
  updatedTokens,
});

const startTokenPolling = (params) => ({
  type: TokenActionTypes.TOKEN_POLL_START,
  params,
});

const stopTokenPolling = () => ({
  type: TokenActionTypes.TOKEN_POLL_STOP,
});

const removeTokenRequest = (name) => ({
  type: TokenActionTypes.REMOVE_TOKEN_REQUEST,
  name,
});

const removeTokenSuccess = (name) => ({
  type: TokenActionTypes.REMOVE_TOKEN_SUCCESS,
  name,
});

const removeTokenFailure = (err) => ({
  type: TokenActionTypes.REMOVE_TOKEN_FAILURE,
  err,
});

const setTokenAddEditStatus = (status: IAddEditStatus) => ({
  type: TokenActionTypes.SET_TOKEN_ADD_EDIT_STATUS,
  status,
});

const watchTokenAddEditStatus = (tokenName: string) => ({
  type: TokenActionTypes.WATCH_TOKEN_ADD_EDIT_STATUS,
  tokenName,
});

const cancelWatchTokenAddEditStatus = () => ({
  type: TokenActionTypes.CANCEL_WATCH_TOKEN_ADD_EDIT_STATUS,
});

const updateTokenRequest = (tokenValues: ITokenFormValues) => ({
  type: TokenActionTypes.UPDATE_TOKEN_REQUEST,
  tokenValues,
});

const updateTokenFailure = (err) => ({
  type: TokenActionTypes.UPDATE_TOKEN_FAILURE,
  err,
});

const updateTokenSuccess = (updatedToken: IToken) => ({
  type: TokenActionTypes.UPDATE_TOKEN_SUCCESS,
  updatedToken,
});

const toggleAddEditTokenModal = () => ({
  type: TokenActionTypes.TOGGLE_ADD_EDIT_TOKEN_MODAL,
});

const setCurrentToken = (currentToken: IToken) => ({
  type: TokenActionTypes.SET_CURRENT_TOKEN,
  currentToken,
});

const setAssociatedCluster = (associatedCluster: string) => ({
  type: TokenActionTypes.SET_ASSOCIATED_CLUSTER,
  associatedCluster,
});

export const TokenActions = {
  removeTokenRequest,
  removeTokenSuccess,
  removeTokenFailure,
  updateTokenRequest,
  updateTokenSuccess,
  updateTokenFailure,
  setTokenAddEditStatus,
  watchTokenAddEditStatus,
  cancelWatchTokenAddEditStatus,
  addTokenSuccess,
  addTokenFailure,
  addTokenRequest,
  updateTokens,
  startTokenPolling,
  stopTokenPolling,
  toggleAddEditTokenModal,
  setCurrentToken,
  setAssociatedCluster,
};
