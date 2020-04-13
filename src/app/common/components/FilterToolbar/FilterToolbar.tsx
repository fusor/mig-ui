import React, { useState } from 'react';
import {
  SelectOptionProps,
  DataToolbar,
  DataToolbarContent,
  DataToolbarToggleGroup,
  DataToolbarItem,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DataToolbarFilter,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { FilterControl } from './FilterControl';

export enum FilterType {
  select = 'select',
  search = 'search',
}

export type FilterValue = string[];

export interface OptionPropsWithKey extends SelectOptionProps {
  key: string;
}

export interface IFilterCategory {
  key: string;
  title: string;
  type: FilterType; // In the future if we want to support arbitrary control types we could have this be a React.Component prop instead
  selectOptions?: OptionPropsWithKey[]; // TODO only if select type?
  placeholderText?: string; // TODO only if select type?
}

export interface IFilterValues {
  [categoryKey: string]: FilterValue;
}

export interface IFilterToolbarProps {
  filterCategories: IFilterCategory[];
  filterValues: IFilterValues;
  setFilterValues: (values: IFilterValues) => void;
}

export const FilterToolbar: React.FunctionComponent<IFilterToolbarProps> = ({
  filterCategories,
  filterValues,
  setFilterValues,
}: IFilterToolbarProps) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(filterCategories[0].key);

  const onCategorySelect = category => {
    setCurrentCategoryKey(category.key);
    setIsCategoryDropdownOpen(false);
  };

  const onClearFilter = (category, chip) => console.log('onClearFilter', { category, chip }); // TODO

  const setFilterValue = (category: IFilterCategory, newValue: FilterValue) =>
    setFilterValues({ ...filterValues, [category.key]: newValue });

  const currentFilterCategory = filterCategories.find(
    category => category.key === currentCategoryKey
  );

  return (
    <DataToolbar id="pv-table-filter-toolbar" clearAllFilters={() => setFilterValues({})}>
      <DataToolbarContent>
        <DataToolbarToggleGroup variant="filter-group" toggleIcon={<FilterIcon />} breakpoint="xl">
          <DataToolbarItem>
            <Dropdown
              toggle={
                <DropdownToggle onToggle={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
                  <FilterIcon /> {currentFilterCategory.title}
                </DropdownToggle>
              }
              isOpen={isCategoryDropdownOpen}
              dropdownItems={filterCategories.map(category => (
                <DropdownItem key={category.key} onClick={() => onCategorySelect(category)}>
                  {category.title}
                </DropdownItem>
              ))}
            />
          </DataToolbarItem>
          {filterCategories.map(category => (
            <DataToolbarFilter
              key={category.key}
              chips={filterValues[category.key] || []}
              deleteChip={onClearFilter} // TODO is this one value or all of a category?
              categoryName={category.title}
              showToolbarItem={currentFilterCategory.key === category.key}
            >
              <FilterControl
                category={category}
                filterValue={filterValues[category.key]}
                setFilterValue={newValue => setFilterValue(category, newValue)}
              />
            </DataToolbarFilter>
          ))}
        </DataToolbarToggleGroup>
      </DataToolbarContent>
    </DataToolbar>
  );
};
