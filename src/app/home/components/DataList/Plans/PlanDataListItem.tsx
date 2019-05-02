import React from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
    Button,
    DataListItem,
    DataListToggle,
} from '@patternfly/react-core';
import { useExpandDataList, useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import Wizard from '../../../../plan/components/Wizard';
import PlanContent from './PlanContent';
import DataListEmptyState from '../DataListEmptyState';

const PlanDataListItem = ({
    clusterList,
    storageList,
    onPlanSubmit,
    isLoading,
    dataList,
    plansDisabled,
    ...props
}) => {
    const [isExpanded, toggleExpanded] = useExpandDataList(false);
    const [isOpen, toggleOpen] = useOpenModal(false);

    if (dataList) {
        return (
            <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
                <Flex width="100%" height="5em" margin=" .5em" >
                    <Box flex="0 0 2em" my="auto">
                        <DataListToggle
                            onClick={() => toggleExpanded()}
                            isExpanded={isExpanded}
                            id='cluster-toggle'
                        />
                    </Box>
                    <Box flex="1" my="auto">
                        Plans
                    </Box>
                    <Box textAlign="left" flex="0 0 10em" my="auto">
                        <Button isDisabled={plansDisabled} onClick={toggleOpen} variant="link">
                            <PlusCircleIcon /> Add Plan
                        </Button>
                        <Wizard
                            clusterList={clusterList}
                            storageList={storageList}
                            isOpen={isOpen}
                            onHandleClose={toggleOpen}
                            isLoading={isLoading}
                            onPlanSubmit={onPlanSubmit}
                        />
                    </Box>
                </Flex>
                {dataList.length > 0 ? (

                    <PlanContent dataList={dataList} isLoading={isLoading} isExpanded={isExpanded} {...props} />
                ) : (
                        <Flex alignItems="center" justifyContent="center">
                            <Box>
                                <DataListEmptyState type="plan" {...props} />
                            </Box>
                        </Flex>
                    )}

            </DataListItem>
        );
    }
    return null;
};

export default PlanDataListItem;
