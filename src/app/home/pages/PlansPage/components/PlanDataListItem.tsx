import React from 'react';
import {
  Badge,
  Button,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  DataListAction,
  TooltipPosition,
  Tooltip,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import WizardContainer from './Wizard/WizardContainer';
import PlanContent from './PlanContent';
import { IAddPlanDisabledObjModel } from '../types';

interface IPlanDataListItemProps {
  id: string;
  clusterList: any;
  storageList: any;
  planList: any;
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  isExpanded: boolean;
  planCount: number;
}

const PlanDataListItem = ({
  id,
  clusterList,
  storageList,
  planList,
  addPlanDisabledObj,
  isExpanded,
  planCount,
}: IPlanDataListItemProps) => {
  const [isWizardOpen, toggleWizardOpen] = useOpenModal(false);
  if (planList) {
    return (
      <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell id="plan-item" key="plans">
                <Flex>
                  <FlexItem>
                    <span id="plans">Plans</span>
                  </FlexItem>
                  <FlexItem>
                    <Badge isRead>{planCount}</Badge>
                  </FlexItem>
                </Flex>
              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Tooltip
              position={TooltipPosition.top}
              content={<div>{addPlanDisabledObj.disabledText}</div>}
            >
              <span>
                <Button
                  isDisabled={addPlanDisabledObj.isAddPlanDisabled}
                  onClick={toggleWizardOpen}
                  variant="secondary"
                >
                  Add
                </Button>
              </span>
            </Tooltip>
            <WizardContainer
              planList={planList}
              clusterList={clusterList}
              storageList={storageList}
              isEdit={false}
              isOpen={isWizardOpen}
              onHandleWizardModalClose={toggleWizardOpen}
            />
          </DataListAction>
        </DataListItemRow>
        <PlanContent
          addPlanDisabledObj={addPlanDisabledObj}
          planList={planList}
          isExpanded={isExpanded}
          toggleWizardOpen={toggleWizardOpen}
        />
      </DataListItem>
    );
  }
  return null;
};

export default PlanDataListItem;
