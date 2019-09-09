/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useContext } from 'react';
import { PlanContext } from '../../../duck/context';
import { Button, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { Flex, Box } from '@rebass/emotion';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';
import theme from '../../../../../theme';
import Loader from 'react-loader-spinner';
import { css } from '@emotion/core';
import { Link } from 'react-router-dom';

const PlanActions = ({ plan }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  const planContext = useContext(PlanContext);
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasErrorCondition,
    hasRunningMigrations,
    hasAttemptedMigration,
    hasSucceededMigration,
    finalMigrationComplete,
    isPlanLocked
  } = plan.PlanStatus;

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const kebabDropdownItems = [
    <DropdownItem
      onClick={() => {
        planContext.handleDeletePlan(plan);
        setKebabIsOpen(false);
      }}
      key="deletePlan"
      isDisabled={
        hasRunningMigrations ||
        isPlanLocked
      }
    >
      Delete
    </DropdownItem>,
    <DropdownItem
      key="showLogs"
      onClick={() => {
        setKebabIsOpen(false);
      }}
    >
      <Link to={'/logs/' + plan.MigPlan.metadata.name}>Logs</Link>

    </DropdownItem>,
  ];

  return (
    <Flex>
      <Box m="auto auto auto 0">
        <PlanStatus plan={plan} />
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={
            hasClosedCondition ||
            !hasReadyCondition ||
            hasErrorCondition ||
            hasRunningMigrations ||
            hasAttemptedMigration ||
            finalMigrationComplete ||
            isPlanLocked
          }
          variant="primary"
          onClick={() => {
            planContext.handleStageTriggered(plan);
          }}
        >
          Stage
        </Button>
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={
            hasClosedCondition ||
            !hasReadyCondition ||
            hasErrorCondition ||
            hasRunningMigrations ||
            finalMigrationComplete ||
            isPlanLocked
          }
          variant="primary"
          onClick={toggleOpen}
        >
          Migrate
        </Button>
        <MigrateModal plan={plan} isOpen={isOpen} onHandleClose={toggleOpen} />
      </Box>

      <Box margin="auto 4px" >
        <Dropdown
          toggle={<KebabToggle
            onToggle={() => setKebabIsOpen(!kebabIsOpen)}
          />}
          isOpen={kebabIsOpen}
          isPlain
          dropdownItems={kebabDropdownItems}
        />
      </Box>
      {hasRunningMigrations && (
        <Box
          css={css`
            height: 100%;
            text-align: center;
            margin: auto 4px auto 4px;
            width: 1em;
          `}
        >
          <Loader type="ThreeDots" color={theme.colors.navy} height="100%" width="100%" />
        </Box>
      )}
    </Flex>
  );
};

export default PlanActions;
