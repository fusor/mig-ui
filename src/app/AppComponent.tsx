import React, { useEffect } from 'react';
import HomeComponent from './home/HomeComponent';
import LoginHandlerComponent from './auth/LoginHandlerComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { ConnectedRouter } from 'connected-react-router';
import CertErrorComponent from './auth/CertErrorComponent';
import OAuthLandingPage from './token/OAuthLandingPage';
import { PollingContext } from './home/duck';
import { StatusPollingInterval } from './common/duck/sagas';
import { clusterSagas } from './cluster/duck';
import { storageSagas } from './storage/duck';
import { planSagas } from './plan/duck';
import { tokenSagas } from './token/duck';
import { ClusterActions } from './cluster/duck/actions';
import { StorageActions } from './storage/duck/actions';
import { PlanActions } from './plan/duck/actions';
import { TokenActions } from './token/duck/actions';
import AlertModal from './common/components/AlertModal';
import ErrorModal from './common/components/ErrorModal';
import { ICluster } from './cluster/duck/types';
import { NON_ADMIN_ENABLED } from '../TEMPORARY_GLOBAL_FLAGS';
import { IDebugTreeNode, RAW_OBJECT_VIEW_ROUTE } from './debug/duck/types';
import RawDebugObjectView from './debug/components/RawDebugObjectView';
import AuthErrorComponent from './auth/AuthErrorComponent';

interface IProps {
  isLoggedIn?: boolean;
  warnMessage: any;
  errorMessage: any;
  errorModalObject: any;
  successMessage: any;
  progressMessage: any;
  startPlanPolling: (params) => void;
  stopPlanPolling: () => void;
  startStoragePolling: (params) => void;
  stopStoragePolling: () => void;
  startClusterPolling: (params) => void;
  stopClusterPolling: () => void;
  startTokenPolling: (params) => void;
  stopTokenPolling: () => void;
  startHookPolling: (params) => void;
  stopHookPolling: () => void;
  updateClusters: (updatedClusters) => void;
  updateStorages: (updatedStorages) => void;
  updatePlans: (updatedPlans) => void;
  updateTokens: (updatedTokens) => void;
  updateHooks: (updatedHooks) => void;
  clusterList: ICluster[];
  debugTree: IDebugTreeNode;
}

const AppComponent: React.SFC<IProps> = ({
  errorMessage,
  errorModalObject,
  successMessage,
  progressMessage,
  warnMessage,
  isLoggedIn,
  startPlanPolling,
  stopPlanPolling,
  startStoragePolling,
  stopStoragePolling,
  startClusterPolling,
  stopClusterPolling,
  startTokenPolling,
  stopTokenPolling,
  startHookPolling,
  stopHookPolling,
  updateClusters,
  updateStorages,
  updatePlans,
  updateTokens,
  updateHooks,
  clusterList,
  debugTree,
}) => {
  const handlePlanPoll = (response) => {
    if (response) {
      updatePlans(response.updatedPlans);
      return true;
    }
    return false;
  };

  const handleClusterPoll = (response) => {
    if (response) {
      updateClusters(response.updatedClusters);
      return true;
    }
    return false;
  };

  const handleStoragePoll = (response) => {
    if (response) {
      updateStorages(response.updatedStorages);
      return true;
    }
    return false;
  };

  const handleTokenPoll = (response) => {
    if (response) {
      updateTokens(response.updatedTokens);
      return true;
    }
    return false;
  };

  const handleHookPoll = (response) => {
    if (response) {
      updateHooks(response.updatedHooks);
      return true;
    }
    return false;
  };

  const startDefaultPlanPolling = () => {
    const planPollParams = {
      asyncFetch: planSagas.fetchPlansGenerator,
      callback: handlePlanPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'plan',
    };
    startPlanPolling(planPollParams);
  };

  const startDefaultClusterPolling = () => {
    const clusterPollParams = {
      asyncFetch: clusterSagas.fetchClustersGenerator,
      callback: handleClusterPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'cluster',
    };
    startClusterPolling(clusterPollParams);
  };

  const startDefaultStoragePolling = () => {
    const storagePollParams = {
      asyncFetch: storageSagas.fetchStorageGenerator,
      callback: handleStoragePoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'storage',
    };
    startStoragePolling(storagePollParams);
  };

  const startDefaultTokenPolling = () => {
    if (NON_ADMIN_ENABLED) {
      const tokenPollParams = {
        asyncFetch: tokenSagas.fetchTokensGenerator,
        callback: handleTokenPoll,
        delay: StatusPollingInterval,
        retryOnFailure: true,
        retryAfter: 5,
        stopAfterRetries: 2,
        pollName: 'token',
      };
      startTokenPolling(tokenPollParams);
    }
  };

  const startDefaultHookPolling = () => {
    const hookPollParams = {
      asyncFetch: planSagas.fetchHooksGenerator,
      callback: handleHookPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'hook',
    };
    startHookPolling(hookPollParams);
  };

  return (
    <React.Fragment>
      <AlertModal alertMessage={progressMessage} alertType="info" />
      <AlertModal alertMessage={errorMessage} alertType="danger" />
      <AlertModal alertMessage={successMessage} alertType="success" />
      <AlertModal alertMessage={warnMessage} alertType="warning" />
      <PollingContext.Provider
        value={{
          startDefaultClusterPolling: () => startDefaultClusterPolling(),
          startDefaultStoragePolling: () => startDefaultStoragePolling(),
          startDefaultPlanPolling: () => startDefaultPlanPolling(),
          startDefaultTokenPolling: () => startDefaultTokenPolling(),
          startDefaultHookPolling: () => startDefaultHookPolling(),
          stopHookPolling: () => stopHookPolling(),
          stopClusterPolling: () => stopClusterPolling(),
          stopStoragePolling: () => stopStoragePolling(),
          stopPlanPolling: () => stopPlanPolling(),
          stopTokenPolling: () => stopTokenPolling(),
          startAllDefaultPolling: () => {
            startDefaultClusterPolling();
            startDefaultStoragePolling();
            startDefaultPlanPolling();
            startDefaultTokenPolling();
            startDefaultHookPolling();
          },
          stopAllPolling: () => {
            stopClusterPolling();
            stopStoragePolling();
            stopPlanPolling();
            stopTokenPolling();
            stopHookPolling();
          },
        }}
      >
        <ErrorModal errorModalObj={errorModalObject} isOpen />

        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/handle-login" component={LoginHandlerComponent} />
            <Route path="/cert-error" component={CertErrorComponent} />
            <Route path="/auth-error" component={AuthErrorComponent} />
            <Route path="/oauth-landing" component={OAuthLandingPage} />
            <PrivateRoute
              path={RAW_OBJECT_VIEW_ROUTE}
              isLoggedIn={isLoggedIn}
              component={RawDebugObjectView}
              componentProps={{ debugTree }}
            />
            <PrivateRoute
              path="/"
              isLoggedIn={isLoggedIn}
              component={HomeComponent}
              componentProps={{ clusterList }}
            />
          </Switch>
        </ConnectedRouter>
      </PollingContext.Provider>
    </React.Fragment>
  );
};

export default connect(
  (state) => ({
    isLoggedIn: !!state.auth.user,
    warnMessage: state.common.warnText,
    errorMessage: state.common.errorText,
    errorModalObject: state.common.errorModalObject,
    successMessage: state.common.successText,
    progressMessage: state.common.progressText,
    clusterList: state.cluster.clusterList,
    debugTree: state.debug.tree,
  }),
  (dispatch) => ({
    startPlanPolling: (params) => dispatch(PlanActions.startPlanPolling(params)),
    stopPlanPolling: () => dispatch(PlanActions.stopPlanPolling()),
    startStoragePolling: (params) => dispatch(StorageActions.startStoragePolling(params)),
    stopStoragePolling: () => dispatch(StorageActions.stopStoragePolling()),
    startClusterPolling: (params) => dispatch(ClusterActions.startClusterPolling(params)),
    stopClusterPolling: () => dispatch(ClusterActions.stopClusterPolling()),
    startTokenPolling: (params) => dispatch(TokenActions.startTokenPolling(params)),
    stopTokenPolling: () => dispatch(TokenActions.stopTokenPolling()),
    startHookPolling: (params) => dispatch(PlanActions.startHookPolling(params)),
    stopHookPolling: () => dispatch(PlanActions.stopHookPolling()),
    updateClusters: (updatedClusters) => dispatch(ClusterActions.updateClusters(updatedClusters)),
    updateStorages: (updatedStorages) => dispatch(StorageActions.updateStorages(updatedStorages)),
    updatePlans: (updatedPlans) => dispatch(PlanActions.updatePlans(updatedPlans)),
    updateTokens: (updatedTokens) => dispatch(TokenActions.updateTokens(updatedTokens)),
    updateHooks: (updatedHooks) => dispatch(PlanActions.updateHooks(updatedHooks)),
  })
)(AppComponent);
