import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { flatten } from 'lodash';
import classNames from 'classnames';
import { Level, LevelItem, Button, Pagination } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAddPlanDisabledObjModel } from '../types';
import AddPlanDisabledTooltip from './AddPlanDisabledTooltip';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  truncate,
  cellWidth,
} from '@patternfly/react-table';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import MigrationIcon from '@patternfly/react-icons/dist/js/icons/migration-icon';

import PlanStatus from './PlanStatus';
import { useSortState } from '../../../../common/duck/hooks';
import { getPlanInfo } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import namespacesIcon from '../../../../common/components/namespaces_icon.svg';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
import { PlanActionsComponent } from './PlanActionsComponent';
const styles = require('./PlansTable.module').default;

interface IPlansTableProps {
  planList: IPlan[];
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleAddWizardOpen: () => void;
}

interface IExpandedCells {
  [planName: string]: number; // Index of expanded column
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  addPlanDisabledObj,
  toggleAddWizardOpen,
}: IPlansTableProps) => {
  const [expandedCells, setExpandedCells] = useState<IExpandedCells>({});

  const columns = [
    { title: 'Name', transforms: [sortable, cellWidth(10)] },
    {
      title: 'Migrations',
      transforms: [sortable, cellWidth(15)],
    },
    { title: 'Source', transforms: [sortable, cellWidth(10)] },
    { title: 'Target', transforms: [sortable, cellWidth(10)] },
    { title: 'Repository', transforms: [sortable, cellWidth(10)] },
    {
      title: 'Namespaces',
      transforms: [sortable, cellWidth(15)],
    },
    { title: 'Last state', transforms: [sortable, cellWidth(40)], cellTransforms: [truncate] },
    '',
  ];

  const getSortValues = (plan: IPlan) => {
    const {
      planName,
      migrationCount,
      sourceClusterName,
      targetClusterName,
      storageName,
      namespaceCount,
      statusText,
    } = getPlanInfo(plan);
    return [
      planName,
      migrationCount,
      sourceClusterName,
      targetClusterName,
      storageName,
      namespaceCount,
      statusText,
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(planList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = flatten(
    currentPageItems.map((plan: IPlan, planIndex) => {
      const {
        planName,
        migrationCount,
        sourceClusterName,
        targetClusterName,
        storageName,
        namespaceCount,
        isMaxResourcesLimitReached,
      } = getPlanInfo(plan);

      return [
        {
          meta: { planName },
          isOpen: Object.keys(expandedCells).includes(planName),
          cells: [
            {
              title: planName,
              props: { component: 'th' },
            },
            {
              title: (
                <>
                  <Link to={`/plans/${plan.MigPlan.metadata.name}/migrations`}>
                    <span className={classNames('pf-c-icon', { 'pf-m-info': migrationCount > 0 })}>
                      <MigrationIcon key="migration-count-icon" /> {migrationCount}
                    </span>
                  </Link>
                </>
              ),
            },

            sourceClusterName,
            targetClusterName,
            storageName,
            {
              title: (
                <>
                  <Link to={`/plans/${plan.MigPlan.metadata.name}/namespaces`}>
                    <img
                      key="namespace-icon"
                      src={namespacesIcon}
                      className={styles.namespacesIcon}
                    />
                    <span key="ns-count-container" className={styles.namespaceCount}>
                      {namespaceCount}
                    </span>
                    {isMaxResourcesLimitReached && (
                      <span className="pf-c-icon pf-m-warning" key="icon-container">
                        <ExclamationTriangleIcon key="warning-icon" />
                      </span>
                    )}
                  </Link>
                </>
              ),
            },
            {
              title: <PlanStatus plan={plan} isNestedDebugView={false} />,
            },
            {
              title: <PlanActionsComponent plan={plan} />,
              props: {
                className: 'pf-c-table__action',
              },
            },
          ],
        },
      ];
    })
  );

  const onExpand = (
    _event: React.SyntheticEvent,
    rowIndex: number,
    colIndex: number,
    isOpen: boolean
  ) => {
    const planName = rows[rowIndex].meta.planName;
    if (!isOpen) {
      setExpandedCells({
        [planName]: colIndex,
      });
    } else {
      setExpandedCells({});
    }
  };

  return (
    <>
      <Level>
        <LevelItem>
          <AddPlanDisabledTooltip addPlanDisabledObj={addPlanDisabledObj}>
            <Button
              id="add-plan-btn"
              onClick={toggleAddWizardOpen}
              isDisabled={addPlanDisabledObj.isAddPlanDisabled}
              variant="secondary"
            >
              Add migration plan
            </Button>
          </AddPlanDisabledTooltip>
        </LevelItem>
        <LevelItem>
          <Pagination
            widgetId="clusters-table-pagination-top"
            itemCount={paginationProps.itemCount}
            perPage={paginationProps.perPage}
            page={paginationProps.page}
            onSetPage={paginationProps.onSetPage}
            onPerPageSelect={paginationProps.onPerPageSelect}
          />
        </LevelItem>
      </Level>
      <Table
        aria-label="Migration plans table"
        cells={columns}
        rows={rows}
        onExpand={onExpand}
        sortBy={sortBy}
        onSort={onSort}
        className={`${spacing.mtMd} ${spacing.mbMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        widgetId="plans-table-pagination-bottom"
        variant="bottom"
        className={spacing.mtMd}
        itemCount={paginationProps.itemCount}
        perPage={paginationProps.perPage}
        page={paginationProps.page}
        onSetPage={paginationProps.onSetPage}
        onPerPageSelect={paginationProps.onPerPageSelect}
      />
    </>
  );
};

export default PlansTable;
