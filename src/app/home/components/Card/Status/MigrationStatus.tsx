/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ResourcesAlmostEmptyIcon, ResourcesAlmostFullIcon, ResourcesFullIcon } from '@patternfly/react-icons';

const MigrationStatus = ({ planStatusCounts }) => {
  const { notStarted, inProgress, completed } = planStatusCounts;
  return (
    <dl className="pf-c-widget-description-list pf-m-inline">
      <dt>
        <span className="pf-c-icon">
          <ResourcesAlmostEmptyIcon />
        </span>

        <span className="pf-c-widget-description-list__num">
          {notStarted.length}
        </span>
      </dt>
      <dd>
        Not started
      </dd>
      <dt>
        <span className="pf-c-icon">
          <ResourcesAlmostFullIcon/>
        </span>
        <span className="pf-c-widget-description-list__num">
          {inProgress.length}
        </span>
      </dt>
      <dd>
        In progress
      </dd>
      <dt>
        <span className="pf-c-icon --pf-global--primary-color--100
">
          <ResourcesFullIcon/>
        </span>
        <span className="pf-c-widget-description-list__num">
          {completed.length}
        </span>
      </dt>
      <dd>
        Complete
      </dd>
    </dl>
  );
};

export default MigrationStatus;
