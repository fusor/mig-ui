import React from 'react';
import { flatten } from 'lodash';
import { Flex, Box } from '@rebass/emotion';
import { DataList, DataListContent, DataListItem, DataListItemRow } from '@patternfly/react-core';
import { DataListAction } from '@patternfly/react-core';
import PlanActions from './PlanActions';
import {
  Table,
  TableHeader,
  TableBody,
  //@ts-ignore
  compoundExpand,
} from '@patternfly/react-table';
import MigrationsTable from './MigrationsTable';
import PlanStatusIcon from '../../Card/Status/PlanStatusIcon';
import styled from '@emotion/styled';
import { ServiceIcon, DatabaseIcon } from '@patternfly/react-icons';
import theme from '../../../../../theme';
import PlanEmptyState from './PlanEmptyState';
interface IPlanContentProps {
  planList: any;
  onPlanSubmit: () => void;
  clusterList: any;
  storageList: any;
  isLoading: boolean;
  isClosing: boolean;
  isExpanded: boolean;
  plansDisabled: boolean;
}

class PlanContent extends React.Component<IPlanContentProps, any> {
  state = {
    rows: [],
  };
  componentDidUpdate(prevProps, prevState) {
    if (this.props.planList !== prevProps.planList) {
      const mappedRows = this.props.planList.map((plan, planIndex) => {
        const MigrationsIcon = styled(ServiceIcon)`
          color: ${() => (plan.Migrations.length > 0 ? theme.colors.blue : theme.colors.black)};
        `;
        const parentIndex = planIndex * 2;
        const planName = plan.MigPlan.metadata.name;
        const planKey = `${planName}-${planIndex}`;

        //check previous expanded value
        let isOpenPrev = null;
        if (prevState.rows.length > 0) {
          const matchingIndex = prevState.rows.filter((row, i) => i === parentIndex);
          if (matchingIndex[0] && matchingIndex[0].cells.length > 0) {
            isOpenPrev = matchingIndex[0].cells[1].props.isOpen;
          }
        }

        const migStorageName = plan.MigPlan.spec.migStorageRef ?
          plan.MigPlan.spec.migStorageRef.name : 'N/A';

        const pvCount = plan.MigPlan.spec.persistentVolumes ?
          plan.MigPlan.spec.persistentVolumes.length : 0;
        return [
          {
            cells: [
              {
                title: (
                  <Flex>
                    <Box m="0 5px 0 0">
                      <PlanStatusIcon plan={plan} isClosing={this.props.isClosing} />
                    </Box>
                    <Box m="auto 0 auto 0">
                      <span>{plan.MigPlan.metadata.name}</span>
                    </Box>
                  </Flex>
                ),

                props: { component: 'th' },
              },
              {
                title: (
                  <React.Fragment>
                    <Flex>
                      <Box m="0 5px 0 0" key={planKey + '-icon'}>
                        <MigrationsIcon />
                      </Box>
                      <Box m="auto 0 auto 0" key={planKey + '-text'}>
                        <span>{plan.Migrations.length || 0}</span>
                      </Box>
                    </Flex>
                  </React.Fragment>
                ),

                props: {
                  isOpen: isOpenPrev || false,
                  ariaControls: 'migrations-history-expansion-table',
                },
              },
              {
                title: <span>{plan.MigPlan.spec.srcMigClusterRef.name}</span>,
              },
              {
                title: <span>{plan.MigPlan.spec.destMigClusterRef.name}</span>,
              },
              {
                title: <span>{migStorageName}</span>,
              },
              {
                title: (
                  <Flex>
                    <Box m="0 5px 0 0">
                      <DatabaseIcon />
                    </Box>
                    <Box m="auto 0 auto 0">
                      <span>{pvCount}</span>
                    </Box>
                  </Flex>
                ),
              },
              {
                title: <PlanActions plan={plan} isClosing={this.props.isClosing} isLoading={this.props.isLoading} />,
              },
            ],
          },
          {
            parent: parentIndex,
            compoundParent: 1,
            cells: [
              {
                title: (
                  <MigrationsTable
                    type="Migrations"
                    migrations={plan.Migrations}
                    id="migrations-history-expansion-table"
                  />
                ),
                props: { colSpan: 9, className: 'pf-m-no-padding' },
              },
            ],
          },
        ];
      });
      this.setState({ rows: flatten(mappedRows) });
    }
  }
  StyledDataListAction = styled(DataListAction)``;

  columns = [
    'Name',
    {
      title: 'Migrations',
      cellTransforms: [compoundExpand],
    },
    {
      title: 'Source',
    },
    {
      title: 'Target',
    },
    'Repository',
    {
      title: 'Persistent Volumes',
      cellTransforms: [compoundExpand],
    },
    'Last Status',
  ];

  onExpand = (event, rowIndex, colIndex, isOpen, rowData, extraData) => {
    const { rows } = this.state;
    if (!isOpen) {
      // close all expanded rows
      this.state.rows.forEach(row => {
        //set all other expanded cells false in this row if we are expanding
        row.cells.forEach(cell => {
          if (cell.props) {
            cell.props.isOpen = false;
          }
        });
        row.isOpen = false;
      });
      rows[rowIndex].cells[colIndex].props.isOpen = true;
      rows[rowIndex].isOpen = true;
    } else {
      rows[rowIndex].cells[colIndex].props.isOpen = false;
      rows[rowIndex].isOpen = rows[rowIndex].cells.some(cell => cell.props && cell.props.isOpen);
    }
    this.setState({ rows });
  };

  render() {
    return (
      <DataListContent
        noPadding
        aria-label="plan-items-content-containter"
        isHidden={!this.props.isExpanded}
      >
        {this.props.planList.length > 0 ? (
          <DataList aria-label="plan-item-list">
            <DataListItem key="id" aria-labelledby="simple-item1">
              <DataListItemRow>
                <Table
                  aria-label="migrations-history-table"
                  onExpand={this.onExpand}
                  rows={this.state.rows}
                  //@ts-ignore
                  cells={this.columns}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              </DataListItemRow>
            </DataListItem>
          </DataList>
        ) : (
            <PlanEmptyState
              clusterList={this.props.clusterList}
              storageList={this.props.storageList}
              isLoading={this.props.isLoading}
              onPlanSubmit={this.props.onPlanSubmit}
              plansDisabled={this.props.plansDisabled}
            />
          )}
      </DataListContent>
    );
  }
}
export default PlanContent;
