import React from 'react';
import { Table, TableHeader, TableBody, sortable, SortByDirection } from '@patternfly/react-table';
import { EmptyState, ProgressVariant } from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Flex, Box } from '@rebass/emotion';
import styled from '@emotion/styled';
import moment from 'moment';
import { MigrationIcon } from '@patternfly/react-icons';
import { Progress, ProgressSize } from '@patternfly/react-core';
import { any } from 'prop-types';

interface IProps {
  type: string;
  id: string;
  migrations: any;
  plan: any;
}

export default class MigrationsTable extends React.Component<IProps, any> {
  state = {
    columns: [
      { title: 'Type' },
      { title: 'Start Time' },
      { title: 'End Time' },
      'PVs Moved',
      'PVs Copied',
      'Status',
    ],
    rows: [],
  };

  componentDidMount = () => this.setState({
    rows: this.getMigrationRows()
  });

  getStatus = (plan, migration) => {
    const status = {
      progress: null,
      start: 'TBD',
      end: 'TBD',
      moved: 0,
      copied: 0,
      stepName: 'Not started',
      isFailed: false,
      isSucceeded: false,
    };
    if (plan.spec.persistentVolumes) {
      status.copied = plan.spec.persistentVolumes.filter(p => p.selection.action === 'copy').length;
      if (!migration.spec.stage) {
        status.moved = plan.spec.persistentVolumes.length - status.copied;
      }
    }
    if (migration.status) {
      if (migration.status.startTimestamp) {
        status.start = moment(migration.status.startTimestamp).format('LLL');
      }
      let endTime;
      endTime = migration.status.conditions
        .filter(c => c.type === 'Succeeded' || c.type === 'Failed')
        .map(c => c.lastTransitionTime)
        .toString();
      status.end = endTime ? moment(endTime).format('LLL') : 'TBD';

      if (migration.status.conditions.length) {
        // For successful migrations, show green 100% progress
        const succeededCondition = migration.status.conditions.find(c => {
          return c.type === 'Succeeded';
        });
        if (succeededCondition !== undefined) {
          status.progress = 100;
          status.isSucceeded = true;
          status.stepName = 'Completed';
          return status;
        }

        // For failed migrations, show red 100% progress
        const failedCondition = migration.status.conditions.find(c => {
          return c.type === 'Failed';
        });
        if (failedCondition !== undefined) {
          status.progress = 100;
          status.isFailed = true;
          status.stepName = failedCondition.reason;
          return status;
        }

        // For running migrations, calculate percent progress
        const runningCondition = migration.status.conditions.find(c => {
          return c.type === 'Running';
        });
        if (runningCondition !== undefined) {
          status.stepName = runningCondition.reason;
          // Match string in format 'Step: 16/26'. Capture both numbers.
          const matches = runningCondition.message.match(/(\d+)\/(\d+)/);
          if (matches && matches.length === 3) {
            const currentStep = parseInt(matches[1], 10);
            const totalSteps = parseInt(matches[2], 10);
            if (!isNaN(currentStep) && !isNaN(totalSteps)) {
              status.progress = (currentStep / totalSteps) * 100;
            }
          }
          return status;
        }
      }
    }
    return status;
  };

  getMigrationRows = () => {
    return this.props.migrations.map((migration, migrationIndex) => {
      const status = this.getStatus(this.props.plan, migration);

      const StyledBox = styled(Box)`
        position: absolute;
        left: 40px;
      `;
      const type = migration.spec.stage ? 'Stage' : 'Migration';
      const progressVariant = status.isSucceeded ? ProgressVariant.success :
        (status.isFailed ? ProgressVariant.danger : ProgressVariant.info);

      return [
        {
          title: (
            <Flex>
              <StyledBox>
                <StatusIcon isReady={!status.isFailed} />
              </StyledBox>
              <Box>{type}</Box>
            </Flex>
          ),
        },
        { title: status.start },
        { title: status.end },
        { title: status.moved },
        { title: status.copied },
        {
          title: (
            <div>
              {status.progress && (
                <Progress
                  value={status.progress}
                  title={status.stepName}
                  size={ProgressSize.sm}
                  variant={progressVariant}
                />
              )}
            </div>
          ),
        },
      ];
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.migrations !== prevProps.migrations) {
      const mappedRows = this.getMigrationRows();
      this.setState({ rows: mappedRows });
    }
  }
  onSort = (_event, index, direction) => {
    const sortedRows = this.state.rows.sort((a, b) =>
      a[index] < b[index] ? -1 : a[index] > b[index] ? 1 : 0
    );
    this.setState({
      sortBy: {
        index,
        direction,
      },
      rows: direction === SortByDirection.asc ? sortedRows : sortedRows.reverse(),
    });
  };

  render() {
    const { columns, rows } = this.state;
    const { type, migrations } = this.props;
    return (
      <React.Fragment>
        {migrations.length > 0 ? (
          <Table
            aria-label="migrations-history-table"
            //@ts-ignore
            cells={columns}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
        ) : (
            <EmptyState variant="large">No migrations started</EmptyState>
          )}
      </React.Fragment>
    );
  }
}
