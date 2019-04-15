import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';

const options = [
  { value: 'copy', label: 'copy' },
  { value: 'move', label: 'move' },
];
interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
  rows: any;
  selectAll: any;
  checked: any;
}
interface IProps {
  values: any;
}

class VolumesTable extends React.Component<any, any> {
  handleTypeChange = (row, val) => {
    const { persistentVolumes } = this.props.values;
    const objIndex = persistentVolumes.findIndex(obj => obj.id === row.original.id);

    const updatedObj = { ...persistentVolumes[objIndex], type: val.value };

    const updatedData = [
      ...persistentVolumes.slice(0, objIndex),
      updatedObj,
      ...persistentVolumes.slice(objIndex + 1),
    ];
    this.props.setFieldValue('persistentVolumes', updatedData);
  }
  state = {
    page: 1,
    selectedOption: null,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    checked: [],
    selectAll: false,
  };

  render() {
    const { values } = this.props;
    const { rows, selectedOption } = this.state;
    if (rows !== null) {
      return (
        <React.Fragment>
          <ReactTable
            css={css`
              font-size: 14px;
              .rt-td{
                overflow: visible;
              }
            `}
            data={values.persistentVolumes}
            columns={[
              {
                Header: 'PV Name',
                accessor: 'name',
                width: 180,
                resizable: false,

              },
              {
                Header: 'Project',
                accessor: 'project',
                width: 150,
                resizable: false,
              },
              {
                Header: 'Storage Class',
                accessor: 'storageClass',
                width: 150,
                resizable: false,

              },
              {
                Header: 'Size',
                accessor: 'size',
                width: 75,
                resizable: false,
              },
              {
                Header: 'Deployment',
                accessor: 'deployment',
                width: 180,
                resizable: false,
              },
              {
                Header: 'Type',
                accessor: 'type',
                width: 120,
                resizable: false,
                Cell: row => (
                  <Select
                    onChange={(val: any) => this.handleTypeChange(row, val)}
                    options={options}
                    name="persistentVolumes"
                    value={{ label: row.original.type, value: row.original.type }}

                  />
                ),
              },

              {
                Header: 'Details',
                accessor: 'details',
                width: 40,
                resizable: false,
                Cell: row => (
                  <a
                    href="https://google.com"
                    target="_blank"

                  >view
                  </a>
                ),
              },
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          />
        </React.Fragment>
      );
    } else {
      return <div />;
    }
  }
}
export default VolumesTable;
