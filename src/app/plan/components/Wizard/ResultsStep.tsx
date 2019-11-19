/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import styled from '@emotion/styled';
import { Box } from '@rebass/emotion';
import { RedoIcon } from '@patternfly/react-icons';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import StatusIcon from '../../../common/components/StatusIcon';
import { ICurrentPlanStatus, CurrentPlanState } from '../../duck/reducers';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import { OutlinedQuestionCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons';
interface IProps {
  values: any;
  errors: any;
  startPlanStatusPolling: (planName) => void;
  onClose: () => void;
  currentPlan: any;
  currentPlanStatus: ICurrentPlanStatus;
  isPollingStatus: boolean;
}



const ResultsStep: React.FunctionComponent<IProps> = props => {
  const { values, currentPlan, currentPlanStatus, isPollingStatus, startPlanStatusPolling, onClose } = props;
  const handlePollRestart = () => {
    startPlanStatusPolling(values.planName);
  };

  function HeaderIcon({ state }) {
    switch (state) {
      case CurrentPlanState.Pending:
        return <Spinner size="xl" />;
      case CurrentPlanState.Ready:
        return <StatusIcon isReady={true} />;
      case CurrentPlanState.Critical:
        return <StatusIcon isReady={false} />;
      case CurrentPlanState.Warn:
        return <span className="pf-c-icon pf-m-warning">
          <WarningTriangleIcon />
        </span>;
      default:
        return null;
    }
  }
  function HeaderText({ state }): any {
    const StyledPlanName = styled.span`
      display: inline-block;
      font-size: 1.3em;
      font-weight: 900;
    `;
    const StyledValidationText = styled.span`
      font-size: 1.3em;
      font-weight: 300;
      display: inline-block;
    `;

    switch (state) {
      case CurrentPlanState.Pending:
        return <StyledValidationText>
          Validating migration plan
          {` `}
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {`.`}
        </StyledValidationText>;
      case CurrentPlanState.Ready:
        return <StyledValidationText>
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {` `}
          has been validated.
        </StyledValidationText>;
      case CurrentPlanState.Warn:
        return <StyledValidationText>
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {` `}
          has been validated with warning condition(s). See warning message.
        </StyledValidationText>;
      case CurrentPlanState.Critical:
        return <StyledValidationText>
          Failed to validate migration plan
          {` `}
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {`.`}
        </StyledValidationText>;
      case CurrentPlanState.TimedOut:
        return <StyledValidationText>
          Failed to validate migration plan
          {` `}
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {`. Please Try again.`}
        </StyledValidationText>;
      default:
        return null;
    }
  }
  function BodyText({ state, errorMessage, warnMessage }): any {
    const StyledBodyText = styled.span`
      font-size: 1.0em;
      font-weight: 300;
      display: inline-block;
      font-style: italic;
    `;

    switch (state) {
      case CurrentPlanState.Pending:
        return <StyledBodyText>
          This might take a few minutes.
        </StyledBodyText>;
      case CurrentPlanState.Warn:
        return <React.Fragment>
          <StyledBodyText>
            {warnMessage}
          </StyledBodyText>

        </React.Fragment>;
      case CurrentPlanState.Ready:
        return <StyledBodyText>
          Select an action from the Migration Plans section of the dashboard to start the migration
        </StyledBodyText>;
      case CurrentPlanState.Critical:
        return <StyledBodyText>
          {errorMessage}
        </StyledBodyText>;
      default:
        return null;
    }
  }
  function FooterText({ state }): any {
    switch (state) {
      case CurrentPlanState.Pending:
        return null;
      case CurrentPlanState.Warn:
        return <Button onClick={onClose} variant="primary">Close</Button>;
      case CurrentPlanState.Ready:
        return <Button onClick={onClose} variant="primary">Close</Button>;
      case CurrentPlanState.Critical:
        return <Button onClick={onClose} variant="primary">Close</Button>;
      case CurrentPlanState.TimedOut:
        return <Box>
          <Button
            style={{ marginRight: '10px' }}
            onClick={onClose}
            variant="primary">
            Close
            </Button>
          <Button
            style={{ marginLeft: '10px', marginRight: '10px' }}
            onClick={handlePollRestart} disabled={isPollingStatus} variant="secondary" >Check Connection</Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Re-check plan status.
            </div>}>
            <span className="pf-c-icon"><OutlinedQuestionCircleIcon /></span>
          </Tooltip>
        </Box>;
      default:
        return null;
    }
  }
  const StyledCard = styled(Card)`
    margin: auto;
    width: 50em;
  `;

  return (
    <StyledCard>
      <CardHeader>
        <HeaderIcon
          state={currentPlanStatus.state}
        />
        <HeaderText
          state={currentPlanStatus.state}
        />
      </CardHeader>
      <CardBody>
        <BodyText
          state={currentPlanStatus.state}
          errorMessage={currentPlanStatus.errorMessage}
          warnMessage={currentPlanStatus.warnMessage}
        />
      </CardBody>
      <CardFooter>
        <FooterText
          state={currentPlanStatus.state}
        />
      </CardFooter>
    </StyledCard>
  );
};

export default ResultsStep;
