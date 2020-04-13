import React, { useState } from 'react';
import {
  TextContent,
  Text,
  TextVariants,
  Popover,
  PopoverPosition,
  Title,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Grid,
  GridItem,
  Pagination,
  PaginationVariant,
  SelectOptionObject,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { Table, TableVariant, TableHeader, TableBody } from '@patternfly/react-table';
import ReactJson from 'react-json-view';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect from '../../../common/components/SimpleSelect';
import { usePaginationState } from '../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
  IFilterValues,
  OptionPropsWithKey,
} from '../../../common/components/FilterToolbar';

const styles = require('./VolumesTable.module');

interface IVolumesTableProps
  extends Pick<IOtherProps, 'isFetchingPVResources' | 'pvResourceList'>,
    Pick<IFormValues, 'persistentVolumes'> {
  onTypeChange: (pvIndex: number, value: string) => void;
}

interface OptionWithValue extends SelectOptionObject {
  value: string;
}

const capitalize = (s: string) => {
  if (s.charAt(0)) {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  } else {
    return s;
  }
};

const VolumesTable: React.FunctionComponent<IVolumesTableProps> = ({
  isFetchingPVResources,
  pvResourceList,
  persistentVolumes,
  onTypeChange,
}: IVolumesTableProps) => {
  const columns = [
    { title: 'PV name' },
    { title: 'Claim' },
    { title: 'Namespace' },
    { title: 'Storage class' },
    { title: 'Size' },
    { title: 'Migration type' },
    { title: 'Details' },
  ];

  const rows = persistentVolumes.map((pv, pvIndex) => {
    const matchingPVResource = pvResourceList.find(pvResource => pvResource.name === pv.name);
    const migrationTypeOptions = pv.supportedActions.map(
      (action: string) =>
        ({
          value: action,
          toString: () => capitalize(action),
        } as OptionWithValue)
    );
    return {
      cells: [
        pv.name,
        pv.claim,
        pv.project,
        pv.storageClass,
        pv.size,
        {
          title: (
            <SimpleSelect
              aria-label="Select migration type"
              onChange={(option: OptionWithValue) => onTypeChange(pvIndex, option.value)}
              options={migrationTypeOptions}
              value={migrationTypeOptions.find(option => option.value === pv.type)}
              placeholderText={null}
            />
          ),
          key: pv.type,
        },
        {
          title: (
            <Popover
              className={styles.jsonPopover}
              position={PopoverPosition.bottom}
              bodyContent={
                matchingPVResource ? (
                  <ReactJson src={matchingPVResource} enableClipboard={false} />
                ) : (
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={WarningTriangleIcon} />
                    <Title headingLevel="h5" size="sm">
                      No PV data found
                    </Title>
                    <EmptyStateBody>Unable to retrieve PV data</EmptyStateBody>
                  </EmptyState>
                )
              }
              aria-label="pv-details"
              closeBtnAriaLabel="close-pv-details"
              maxWidth="200rem"
            >
              <Button isDisabled={isFetchingPVResources} variant="link">
                View JSON
              </Button>
            </Popover>
          ),
        },
      ],
    };
  });

  const filterCategories: FilterCategory[] = [
    {
      key: 'name',
      title: 'PV name',
      type: FilterType.search,
      placeholderText: 'Filter by PV name...',
    },
    {
      key: 'claim',
      title: 'Claim',
      type: FilterType.search,
      placeholderText: 'Filter by claim...',
    },
    {
      key: 'namespace',
      title: 'Namespace',
      type: FilterType.search,
      placeholderText: 'Filter by namespace...',
    },
    {
      key: 'storageClass',
      title: 'Storage class',
      type: FilterType.search,
      placeholderText: 'Filter by storage class...',
    },
    {
      key: 'type',
      title: 'Migration type',
      type: FilterType.select,
      selectOptions: [
        { key: 'copy', value: 'Copy' },
        { key: 'move', value: 'Move' },
      ],
    },
  ];

  const [filterValues, setFilterValues] = useState<IFilterValues>({});

  const { currentPageItems, paginationProps } = usePaginationState(rows, 10);

  // TODO: sorting

  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>Choose to move or copy persistent volumes:</Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <Level>
          <LevelItem>
            <FilterToolbar
              filterCategories={filterCategories}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
            />
          </LevelItem>
          <LevelItem>
            <Pagination widgetId="pv-table-pagination-top" {...paginationProps} />
          </LevelItem>
        </Level>
        <Table
          aria-label="Persistent volumes table"
          variant={TableVariant.compact}
          cells={columns}
          rows={currentPageItems}
        >
          <TableHeader />
          <TableBody />
        </Table>
        <Pagination
          widgetId="pv-table-pagination-bottom"
          variant={PaginationVariant.bottom}
          className={spacing.mtMd}
          {...paginationProps}
        />
      </GridItem>
    </Grid>
  );
};

export default VolumesTable;
