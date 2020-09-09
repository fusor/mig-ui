import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  PageSection,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
  Card,
  CardBody,
  Alert,
  TreeView,
  TreeViewDataItem,
  Split,
  SplitItem,
  SearchInput,
  Button,
} from '@patternfly/react-core';
import { push } from 'connected-react-router';
import {
  DEBUG_PATH_SEARCH_KEY,
  RAW_OBJECT_VIEW_ROUTE,
  IDebugTreeNode,
} from '../../../debug/duck/types';
import { IReduxState } from '../../../../reducers';
import { IDebugReducerState, DebugActions } from '../../../debug/duck';

import { convertRawTreeToViewTree } from '../../../debug/duck/utils';

interface IBasePlanDebugPageProps {
  debug: IDebugReducerState;
  fetchDebugTree: (planName: string) => void;
  routeRawDebugObject: (path: string) => void;
}

const BasePlanDebugPage: React.FunctionComponent<IBasePlanDebugPageProps> = ({
  debug,
  fetchDebugTree,
  routeRawDebugObject,
}: IBasePlanDebugPageProps) => {
  const { planName } = useParams();

  const refreshDebugTree = () => {
    fetchDebugTree(planName);
  };

  useEffect(() => {
    refreshDebugTree();
  }, []);

  const viewRawDebugObject = (node: IDebugTreeNode) => {
    routeRawDebugObject(node.objectLink);
  };

  const [searchText, setSearchText] = useState('');

  const filterSubtree = (items: TreeViewDataItem[]): TreeViewDataItem[] =>
    items
      .map((item) => {
        const nameMatches = (item.name as string).toLowerCase().includes(searchText.toLowerCase());
        if (!item.children) {
          return nameMatches ? item : null;
        }
        const filteredChildren = filterSubtree(item.children);
        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((item) => !!item) as TreeViewDataItem[];

  const treeData = debug.tree && convertRawTreeToViewTree(debug.tree, viewRawDebugObject);
  let filteredTreeData = treeData;
  if (searchText && treeData) {
    filteredTreeData = filterSubtree(treeData);
  }

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          Migration plan resources (DEBUG)
        </Title>
      </PageSection>
      <PageSection>
        {debug.errMsg ? (
          <Alert variant="danger" title={`Error loading debug data for plan "${planName}"`}>
            <p>{debug.errMsg}</p>
          </Alert>
        ) : debug.isLoading ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              <Split hasGutter>
                <SplitItem isFilled>
                  <SearchInput
                    placeholder="Type to search"
                    value={searchText}
                    onChange={setSearchText}
                    onClear={() => setSearchText('')}
                  />
                </SplitItem>
                <SplitItem>
                  <Button onClick={refreshDebugTree} variant="primary">
                    Refresh
                  </Button>
                </SplitItem>
              </Split>
              <TreeView data={filteredTreeData} defaultAllExpanded />
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export const PlanDebugPage = connect(
  (state: IReduxState) => ({
    debug: state.debug,
  }),
  (dispatch) => ({
    fetchDebugTree: (planName: string) => dispatch(DebugActions.debugTreeFetchRequest(planName)),
    routeRawDebugObject: (path: string) => {
      const encodedPath = encodeURI(path);
      dispatch(
        push({
          pathname: RAW_OBJECT_VIEW_ROUTE,
          search: `?${DEBUG_PATH_SEARCH_KEY}=${encodedPath}`,
        })
      );
    },
  })
)(BasePlanDebugPage);
