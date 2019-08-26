import React from 'react';
import { connect } from 'react-redux';
import { Flex, Box, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import {
  Brand,
  DropdownItem,
  Page,
  PageHeader,
  PageSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { BellIcon, CogIcon } from '@patternfly/react-icons';

import { ClusterActions } from '../cluster/duck/actions';
import { StorageActions as StorageActions } from '../storage/duck/actions';


import { clusterOperations } from '../cluster/duck';
import { storageOperations } from '../storage/duck';
import { planOperations } from '../plan/duck';
import DetailViewComponent from './DetailViewComponent';
import DashboardCard from './components/Card/DashboardCard';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import {
  PollingActions
} from '../common/duck/actions';
import openshiftLogo from '../../assets/Logo-Cluster_Application_Migration.svg';
import { StatusPollingInterval } from '../common/duck/sagas';
import { PollingContext } from './duck/context';

interface IProps {
  loggingIn?: boolean;
  user: any;
  allClusters: any[];
  allStorage: any[];
  allPlans: any[];
  fetchPlans: () => void;
  startStoragePolling: (params) => void;
  stopStoragePolling: () => void;
  startClusterPolling: (params) => void;
  stopClusterPolling: () => void;
  updateClusters: (updatedClusters) => void;
  updateStorages: (updatedStorages) => void;
  onLogout: () => void;
  isFetchingClusters: boolean;
  isFetchingStorage: boolean;
  isFetchingPlans: boolean;
  isClusterError: boolean;
  isStorageError: boolean;
  isPlanError: boolean;
  planStatusCounts: any;
}

interface IState {
  isDropdownOpen?: boolean;
  isKebabDropdownOpen?: boolean;
  isNavOpen?: boolean;
  activeGroup: string;
  activeItem: string;
  expanded: {
    [s: string]: boolean;
  };
}

export const DataItemsLength = 3;
export enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
}
class HomeComponent extends React.Component<IProps, IState> {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isNavOpen: false,
    activeGroup: 'grp-1',
    activeItem: 'grp-1_itm-1',
    expanded: {
      'clusterList': false,
      'storageList': false,
      'planList': false,
    },
  };

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId,
    });
  };

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen,
    });
  };

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen,
    });
  };

  onKebabDropdownToggle = isKebabDropdownOpen => {
    this.setState({
      isKebabDropdownOpen,
    });
  };

  onKebabDropdownSelect = event => {
    this.setState({
      isKebabDropdownOpen: !this.state.isKebabDropdownOpen,
    });
  };

  handleExpand = (id: string) => {
    const expanded = !this.state.expanded[id];
    const newExpanded = Object.assign({}, this.state.expanded);
    Object.values(DataListItems).map(
      expandItem => newExpanded[expandItem] = false
    );
    newExpanded[id] = expanded;
    this.setState({ expanded: newExpanded });
  }

  kebabDropdownItems = [
    <DropdownItem key="0">
      <BellIcon /> Notifications
    </DropdownItem>,
    <DropdownItem key="1">
      <CogIcon /> Settings
    </DropdownItem>,
  ];

  userDropdownItems = [
    <DropdownItem key="0" onClick={this.props.onLogout}>
      Logout
    </DropdownItem>,
  ];

  handleClusterPoll = response => {
    if (response && response.isSuccessful === true) {
      this.props.updateClusters(response.updatedClusters);
      return true;
    }

    return false;
  };

  handleStoragePoll = response => {
    if (response && response.isSuccessful === true) {
      this.props.updateStorages(response.updatedStorages);
      return true;
    }

    return false;
  };

  startDefaultClusterPolling = () => {
    const clusterPollParams = {
      asyncFetch: clusterOperations.fetchClustersGenerator,
      callback: this.handleClusterPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
    };
    this.props.startClusterPolling(clusterPollParams);
  }

  startDefaultStoragePolling = () => {
    const storagePollParams = {
      asyncFetch: storageOperations.fetchStorageGenerator,
      callback: this.handleStoragePoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
    };
    this.props.startStoragePolling(storagePollParams);
  }

  componentDidMount = () => {
    this.startDefaultClusterPolling();
    this.startDefaultStoragePolling();
    this.props.fetchPlans();
  };

  render() {
    const { isDropdownOpen, activeItem, activeGroup, isNavOpen } = this.state;

    const StyledPageHeader = styled(PageHeader)`
      .pf-c-brand {
        height: 2.5em;
      }
      background-color: #151515 !important;
      .pf-c-page__header-brand {
        background-color: #151515 !important;
        min-width: 56em;
      }
      -moz-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      -webkit-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      text-decoration: none;
      .pf-c-page__header-brand-link {
        text-decoration: none;
      }
    `;

    const Header = (
      <StyledPageHeader
        logo={
          <React.Fragment>
            <Brand src={openshiftLogo} alt="OpenShift Logo" />
          </React.Fragment>
        }
      />
    );

    const {
      isFetchingStorage,
      isFetchingClusters,
      isFetchingPlans,
      allStorage,
      allPlans,
      allClusters,
      isClusterError,
      isPlanError,
      isStorageError,
      planStatusCounts,
    } = this.props;
    return (
      <Page header={Header}>
        <PageSection>
          <Grid gutter="md">
            <GridItem span={4}>
              <DashboardCard
                type="clusters"
                title="Clusters"
                dataList={allClusters}
                isFetching={isFetchingClusters}
                isError={isClusterError}
                expandDetails={() => this.handleExpand(DataListItems.ClusterList)}
              />
            </GridItem>
            <GridItem span={4}>
              <DashboardCard
                title="Replication Repositories"
                type="repositories"
                dataList={allStorage}
                isFetching={isFetchingStorage}
                isError={isStorageError}
                expandDetails={() => this.handleExpand(DataListItems.StorageList)}
              />
            </GridItem>
            <GridItem span={4}>
              <DashboardCard
                type="plans"
                title="Migration Plans"
                planStatusCounts={planStatusCounts}
                dataList={allPlans}
                isFetching={isFetchingPlans}
                isError={isPlanError}
                expandDetails={() => this.handleExpand(DataListItems.PlanList)}
              />
            </GridItem>
          </Grid>
        </PageSection>
        <PageSection>
          <Flex justifyContent="center">
            <Box flex="0 0 100%">
              <PollingContext.Provider value={{
                startDefaultClusterPolling: () => this.startDefaultClusterPolling(),
                startDefaultStoragePolling: () => this.startDefaultStoragePolling(),
                stopClusterPolling: () => this.props.stopClusterPolling(),
                stopStoragepolling: () => this.props.stopStoragePolling(),
                startAllDefaultPolling: () => {
                  this.startDefaultClusterPolling();
                  this.startDefaultStoragePolling();
                },
                stopAllPolling: () => {
                  this.props.stopClusterPolling();
                  this.props.stopStoragePolling();
                }
              }}>
                <DetailViewComponent expanded={this.state.expanded} handleExpandDetails={this.handleExpand}/>
              </PollingContext.Provider>
            </Box>
          </Flex>
        </PageSection>
        <PageSection>
          {/* <TODO: footer content */}
        </PageSection>
      </Page>
    );
  }
}

export default connect(
  state => ({
    planStatusCounts: planSelectors.getCounts(state),
    allClusters: clusterSelectors.getAllClusters(state),
    allStorage: storageSelectors.getAllStorage(state),
    allPlans: planSelectors.getPlansWithStatus(state),
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    isFetchingClusters: state.cluster.isFetching,
    isFetchingStorage: state.storage.isFetching,
    isFetchingPlans: state.plan.isFetching,
    isClusterError: state.cluster.isError,
    isStorageError: state.storage.isError,
    isPlanError: state.plan.isError,
  }),
  dispatch => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
    fetchPlans: () => dispatch(planOperations.fetchPlans()),
    startStoragePolling: params => dispatch(PollingActions.startStoragePolling(params)),
    stopStoragePolling: () => dispatch(PollingActions.stopStoragePolling()),
    startClusterPolling: params => dispatch(PollingActions.startClusterPolling(params)),
    stopClusterPolling: () => dispatch(PollingActions.stopClusterPolling()),
    updateClusters: updatedClusters => dispatch(ClusterActions.updateClusters(updatedClusters)),
    updateStorages: updatedStorages => dispatch(StorageActions.updateStorages(updatedStorages)),
  })
)(HomeComponent);
