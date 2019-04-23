import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';
import { CheckIcon, ErrorCircleOIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import {
  InProgressIcon,
  OutlinedCircleIcon,
  OutlinedTimesCircleIcon,
} from '@patternfly/react-icons';

import * as React from 'react';

interface IProps {
  status: any;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({
  status,
  ...rest
}) => {
  const InProgress = styled(InProgressIcon)`
    color: ${theme.colors.medGray3};
  `;
  const NotStarted = styled(OutlinedCircleIcon)`
    color: ${theme.colors.blue};
  `;
  const Complete = styled(OutlinedCircleIcon)`
    color: ${theme.colors.statusGreen};
  `;
  if (status.state === 'Not Started') {
    return (
      <NotStarted />
    );
  }

  if (status.state === 'Staged Successfully') {
    return (
      <Complete />
    );
  }
  if (status.state === 'Migrated Successfully') {
    return (
      <Complete />
    );
  }
  if (status.state === 'Staging') {
    return (
      <InProgress />
    );
  }
  if (status.state === 'Migrating') {
    return (
      <InProgress />
    );
  }
};

export default PlanStatusIcon;
