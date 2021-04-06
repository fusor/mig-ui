import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ClustersPage, StoragesPage, PlansPage, PlanDebugPage, LogsPage } from './pages';
import { NamespacesPage } from './pages/PlansPage/pages/NamespacesPage';
import RefreshRoute from '../auth/RefreshRoute';
import { MigrationsPage } from './pages/PlansPage/pages/MigrationsPage';
import { HooksPage } from './pages/HooksPage/HooksPage';
import RawDebugObjectView from '../debug/components/RawDebugObjectView';
import { RAW_OBJECT_VIEW_ROUTE } from '../debug/duck/types';

const HomeComponent: React.FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/clusters" />
      </Route>
      <Route path="*">
        <Switch>
          <Route exact path="/clusters">
            <ClustersPage />
          </Route>
          <Route exact path="/storages">
            <StoragesPage />
          </Route>
          <Route exact path="/plans">
            <PlansPage />
          </Route>
          <Route exact path="/plans/:planName/namespaces">
            <NamespacesPage />
          </Route>
          <Route path="/plans/:planName/migrations">
            <MigrationsPage />
            <PlanDebugPage />
            {/* {debug.objJson && <RawDebugObjectView />} */}
          </Route>
          <Route exact path="/hooks">
            <HooksPage />
          </Route>
          <RefreshRoute exact path="/logs/:planId" isLoggedIn component={LogsPage} />
          <RefreshRoute path={RAW_OBJECT_VIEW_ROUTE} isLoggedIn component={RawDebugObjectView} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Route>
    </Switch>
  );
};

export default HomeComponent;
