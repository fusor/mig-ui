import React from 'react';
import {
  DataListItem,
  DataListToggle,
  DataListContent,
  DataListCell,
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { PlusCircleIcon } from '@patternfly/react-icons';
import { Flex, Box } from '@rebass/emotion';
import { css } from '@emotion/core';

import ClusterDataListComponent from './ClusterDataListComponent';
import StorageDataListComponent from './StorageDataListComponent';
import PlanDataListComponent from './PlanDataListComponent';

import { } from '@patternfly/react-core';
import theme from '../../../theme';
interface IProps {
  isLoading?: boolean;
  id: string;
  title: string;
  addButton?: React.ReactNode;
  onToggle: (id) => void;
  onRemoveItem?: (type, id) => void;
  onAddItem?: () => void;
  onWizardToggle?: () => void;
  filteredDataList?: any[];
  allData: any[];
  isExpanded: boolean;
  plansDisabled?: boolean;
  type?: string;
  associatedPlans?: any;
  // TODO: This all needs to get refactored to more generically handle the
  // differences between those that have edit and remove (cluster and stage)
  // and plans.
  onStageTriggered?: (plan) => void;
  onMigrateTriggered?: (plan) => void;
  onSearch?: (val, otherval) => void;
}

const DetailViewItem: React.FunctionComponent<IProps> = ({
  id,
  title,
  isExpanded,
  onToggle,
  filteredDataList,
  allData,
  plansDisabled,
  addButton,
  onRemoveItem,
  onAddItem,
  type,
  onSearch,
  onStageTriggered,
  onMigrateTriggered,
  associatedPlans,
  onWizardToggle,
  isLoading,
  ...props
}) => {
  let listComponent;
  if (type === 'cluster') {
    listComponent = (
      <ClusterDataListComponent
        onRemoveItem={onRemoveItem}
        dataList={filteredDataList}
        associatedPlans={associatedPlans}
      />
    );
  } else if (type === 'storage') {
    listComponent = (
      <StorageDataListComponent
        onRemoveItem={onRemoveItem}
        dataList={filteredDataList}
        associatedPlans={associatedPlans}
      />
    );
  } else {
    listComponent = (
      <PlanDataListComponent
        onRemoveItem={onRemoveItem}
        onStageTriggered={onStageTriggered}
        onMigrateTriggered={onMigrateTriggered}
        dataList={filteredDataList}
        onWizardToggle={onWizardToggle}
        isLoading={isLoading}
      />
    );
  }

  return (
    <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
      <Flex width="100%" height="5em" margin=" .5em" >
        <Box flex="0 0 2em" my="auto">
          <DataListToggle
            onClick={() => onToggle(id)}
            isExpanded={isExpanded}
            id={id}
          />
        </Box>
        <Box flex="1" my="auto">
          {title}
        </Box>
        <Box textAlign="left" flex="0 0 10em" my="auto">
          {addButton}
        </Box>
      </Flex>
      <DataListContent
        // @ts-ignore
        css={css`
        padding: 0 !important;
          .pf-c-data-list__expandable-content{ 
            padding: 0 !important;
          }
        `}
        aria-label="Primary Content Details"
        isHidden={!isExpanded}
      >
        {/* {(allData && allData.length) > 0 &&
          <InputGroup
            // @ts-ignore
            css={css`
                width: 20% !important;
                margin: auto 0 2em 0 ;
              `}
          >
            <TextInput
              name="textInput11"
              id="textInput11"
              type="search"
              aria-label="search input example"
              onChange={onSearch}
            />
            <Button variant={ButtonVariant.tertiary} aria-label="search button for search input">
              <SearchIcon />
            </Button>
          </InputGroup>
        } */}
        {listComponent}
      </DataListContent>
    </DataListItem>
  );
};

export default DetailViewItem;
