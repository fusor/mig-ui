import React, { useEffect } from 'react';
import { Button, Pagination, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, classNames } from '@patternfly/react-table';
import { LinkIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { usePaginationState, useSortState } from '../../../../common/duck/hooks';
import { getClusterInfo } from '../helpers';
import StatusIcon from '../../../../common/components/StatusIcon';
import ClusterActionsDropdown from './ClusterActionsDropdown';
import IconWithText from '../../../../common/components/IconWithText';
import { ICluster, IClusterAssociatedPlans } from '../../../../cluster/duck/types';
import { IMigMeta } from '../../../../../mig_meta';

interface IClustersTableProps {
  clusterList: ICluster[];
  associatedPlans: IClusterAssociatedPlans;
  migMeta: IMigMeta;
  removeCluster: (clusterName: string) => void;
  toggleAddEditModal: () => void;
}

const ClustersTable: React.FunctionComponent<IClustersTableProps> = ({
  clusterList,
  associatedPlans,
  migMeta,
  removeCluster,
  toggleAddEditModal,
}: IClustersTableProps) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Location', transforms: [sortable] },
    { title: 'Associated plans', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNames(tableStyles.tableAction)] },
  ];

  const getSortValues = (cluster: ICluster) => {
    const { clusterName, clusterUrl, associatedPlanCount, clusterStatus } = getClusterInfo(
      cluster,
      migMeta,
      associatedPlans
    );
    return [clusterName, clusterUrl, associatedPlanCount, clusterStatus, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(clusterList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = currentPageItems.map((cluster: ICluster) => {
    const clusterInfo = getClusterInfo(cluster, migMeta, associatedPlans);
    const { clusterName, clusterStatus, clusterUrl, associatedPlanCount } = clusterInfo;
    return {
      cells: [
        clusterName,
        {
          title: (
            <a target="_blank" href={clusterUrl}>
              {clusterUrl}
            </a>
          ),
        },
        {
          title: <IconWithText icon={<LinkIcon color="#737679" />} text={associatedPlanCount} />,
        },
        {
          title: (
            <IconWithText
              icon={<StatusIcon isReady={clusterStatus} />}
              text={clusterStatus ? `Connected` : `Connection Failed`}
            />
          ),
        },
        {
          title: (
            <ClusterActionsDropdown
              cluster={cluster}
              clusterInfo={clusterInfo}
              removeCluster={removeCluster}
            />
          ),
        },
      ],
    };
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button id="add-cluster-btn" onClick={toggleAddEditModal} variant="secondary">
            Add cluster
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination widgetId="clusters-table-pagination-top" {...paginationProps} />
        </LevelItem>
      </Level>
      <Table
        aria-label="Clusters table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        className={`${spacing.mtMd} ${spacing.mbMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        widgetId="clusters-table-pagination-bottom"
        variant="bottom"
        className={spacing.mtMd}
        {...paginationProps}
      />
    </>
  );
};

export default ClustersTable;
