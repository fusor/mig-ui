import React, { useEffect, useContext, useState } from 'react';
import { connect } from 'react-redux';
import { useRouteMatch, Link, Switch, Route } from 'react-router-dom';
import {
  Card,
  Nav,
  NavList,
  NavItem,
  Page,
  PageSidebar,
  PageSection,
  SkipToContent,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import HeaderComponent from '../common/components/HeaderComponent';
import DetailViewComponent from './DetailViewComponent';
import DashboardCard from './components/Card/DashboardCard';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import { PollingContext } from '../home/duck/context';

const mainContainerId = 'mig-ui-page-main-container';

interface IProps {
  allClusters: any[];
  allStorage: any[];
  allPlans: any[];
  isFetchingClusters: boolean;
  isFetchingStorage: boolean;
  isFetchingPlans: boolean;
  isClusterError: boolean;
  isStorageError: boolean;
  isPlanError: boolean;
  planStatusCounts: any;
}
export const DataItemsLength = 3;
export enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
}

const NavItemLink: React.FunctionComponent<{ to: string; label: string }> = ({ to, label }) => {
  const match = useRouteMatch({ path: to });
  console.log({ to, match });
  return (
    <NavItem isActive={!!match}>
      <Link to={to}>{label}</Link>
    </NavItem>
  );
};

const HomeComponent: React.FunctionComponent<IProps> = (props) => {
  const {
    allClusters,
    allStorage,
    allPlans,
    isFetchingClusters,
    isFetchingStorage,
    isFetchingPlans,
    isClusterError,
    isStorageError,
    isPlanError,
    planStatusCounts,
  } = props;

  const pollingContext = useContext(PollingContext);
  useEffect(() => {
    pollingContext.startAllDefaultPolling();
  }, []);
  const [expandedStateObj, setExpandedStateObj] = useState({
    clusterList: false,
    storageList: false,
    planList: false,
  });

  const handleExpand = (id: string) => {
    const expanded = !expandedStateObj[id];
    const newExpanded = Object.assign({}, expandedStateObj);
    Object.values(DataListItems).map((expandItem) => (newExpanded[expandItem] = false));
    newExpanded[id] = expanded;
    setExpandedStateObj(newExpanded);
  };

  const nav = (
    <Nav aria-label="Page navigation" theme="dark">
      <NavList>
        <NavItemLink to="/clusters" label="Clusters" />
        <NavItemLink to="/storages" label="Replication repositories" />
        <NavItemLink to="/plans" label="Migration plans" />
      </NavList>
    </Nav>
  );

  const tmpDetailsBody = (
    <Card>
      <DetailViewComponent expanded={expandedStateObj} handleExpandDetails={handleExpand} />
    </Card>
  );

  return (
    <Page
      header={HeaderComponent}
      sidebar={<PageSidebar nav={nav} theme="dark" />}
      isManagedSidebar
      skipToContent={<SkipToContent href={`#${mainContainerId}`}>Skip to content</SkipToContent>}
      mainContainerId={mainContainerId}
    >
      <PageSection>
        <Grid gutter="lg" md={6} lg={4}>
          <GridItem>
            <DashboardCard
              type="clusters"
              title="Clusters"
              dataList={allClusters}
              isFetching={isFetchingClusters}
              isError={isClusterError}
              expandDetails={() => handleExpand(DataListItems.ClusterList)}
              loadingTitle="Loading clusters..."
            />
          </GridItem>
          <GridItem>
            <DashboardCard
              title="Replication repositories"
              type="repositories"
              dataList={allStorage}
              isFetching={isFetchingStorage}
              isError={isStorageError}
              expandDetails={() => handleExpand(DataListItems.StorageList)}
              loadingTitle="Loading replication repositories..."
            />
          </GridItem>
          <GridItem>
            <DashboardCard
              type="plans"
              title="Migration Plans"
              planStatusCounts={planStatusCounts}
              dataList={allPlans}
              isFetching={isFetchingPlans}
              isError={isPlanError}
              expandDetails={() => handleExpand(DataListItems.PlanList)}
              loadingTitle="Loading migration plans..."
            />
          </GridItem>
          <GridItem span={12}>
            <Switch>
              <Route exact path="/clusters">
                {tmpDetailsBody}
              </Route>
              <Route exact path="/storages">
                {tmpDetailsBody}
              </Route>
              <Route exact path="/plans">
                {tmpDetailsBody}
              </Route>
            </Switch>
          </GridItem>
        </Grid>
      </PageSection>
    </Page>
  );
};

export default connect(
  (state) => ({
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
  (dispatch) => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
  })
)(HomeComponent);
