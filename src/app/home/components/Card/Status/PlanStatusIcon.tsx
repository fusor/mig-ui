import React from 'react';
import {
  OutlinedCircleIcon,
  ResourcesAlmostEmptyIcon,
  ResourcesFullIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';
import { Popover, PopoverPosition } from '@patternfly/react-core';

import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

interface IProps {
  plan: any;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({ plan }) => {
  const {
    hasFailedCondition,
    hasRunningMigrations,
    hasNotReadyCondition,
    hasSucceededStage,
    hasSucceededMigration,
    isPlanLocked,
    hasConflictCondition,
  } = plan.PlanStatus;

  if (hasFailedCondition || hasNotReadyCondition) {
    return (
      <span className="pf-c-icon pf-m-danger">
        <ResourcesFullIcon />
      </span>
    );
  } else if (hasConflictCondition) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent="Migration plan conflicts occur when multiple plans share the same namespace. You cannot stage or migrate a plan with a conflict. Delete one of the plans to resolve the conflict."
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className="pf-c-icon pf-m-warning">
          <WarningTriangleIcon />
        </span>
      </Popover>
    );
  } else if (hasRunningMigrations || isPlanLocked) {
    return <Spinner size="md" />;
  } else if (hasSucceededMigration) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesFullIcon />
      </span>
    );
  } else if (hasSucceededStage) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesAlmostEmptyIcon />
      </span>
    );
  } else {
    return (
      <span className="pf-c-icon pf-m-info">
        <OutlinedCircleIcon />
      </span>
    );
  }
};

export default PlanStatusIcon;
