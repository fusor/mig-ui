import React from 'react';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import AddEditClusterModal from '../../../../cluster/components/AddEditClusterModal';
import ClusterContent from './ClusterContent';

const ClusterDataListItem = ({
  id,
  isExpanded,
  toggleExpanded,
  dataList,
  associatedPlans,
  migMeta,
  removeCluster,
  ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="cluster-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => toggleExpanded(id)}
            isExpanded={isExpanded}
            id="cluster-toggle"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell id="cluster-item" key="clusters">
                <span id="name">Clusters</span>
              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-cluster" aria-labelledby="plan-item" id="add-cluster">
            <Button aria-label="add-cluster-btn" id="add-cluster-btn" onClick={toggleOpen} variant="link">
              <PlusCircleIcon /> Add cluster
            </Button>
            <AddEditClusterModal isOpen={isOpen} onHandleClose={toggleOpen} />
          </DataListAction>
        </DataListItemRow>
        <ClusterContent
          associatedPlans={associatedPlans}
          dataList={dataList}
          isExpanded={isExpanded}
          migMeta={migMeta}
          removeCluster={removeCluster}
          {...props}
        />
      </DataListItem>
    );
  }
  return null;
};

export default ClusterDataListItem;
