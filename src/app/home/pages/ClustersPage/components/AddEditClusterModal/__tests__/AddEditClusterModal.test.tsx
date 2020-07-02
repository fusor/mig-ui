import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../../../../../../../reducers';

import AddEditClusterModal from '../index';

const store = createStore(rootReducer, {});

describe('<AddEditClusterModal />', () => {
  it('allows filling form with valid values', () => {
    const initialProps = {
      isOpen: true,
    };

    render(
      <Provider store={store}>
        <AddEditClusterModal {...initialProps} />
      </Provider>
    );

    userEvent.type(screen.getByTestId('cluster-name'), 'clustername');
    userEvent.type(screen.getByTestId('url'), 'http://example.com');
    userEvent.type(screen.getByTestId('token'), 'qwertyuiop');

    expect(screen.getByDisplayValue('clustername')).toBeInTheDocument;
    expect(screen.getByDisplayValue('http://example.com')).toBeInTheDocument;
    expect(screen.getByDisplayValue('qwertyuiop')).toBeInTheDocument;
    expect(screen.getByRole('button', { name: 'Add cluster' })).toBeEnabled;
  });

  it('forbids filling from with unvalid name', () => {
    const initialProps = {
      isOpen: true,
    };

    render(
      <Provider store={store}>
        <AddEditClusterModal {...initialProps} />
      </Provider>
    );

    userEvent.type(screen.getByTestId('cluster-name'), '-clustername');
    userEvent.type(screen.getByTestId('url'), 'example.com');

    expect(screen.getByRole('button', { name: 'Add cluster' })).toBeDisabled;
  });

  it('cannot add a cluster with unvalid cluster url', () => {
    const initialProps = {
      isOpen: true,
    };

    render(
      <Provider store={store}>
        <AddEditClusterModal {...initialProps} />
      </Provider>
    );

    userEvent.type(screen.getByTestId('url'), 'example.com');

    expect(screen.getByRole('button', { name: 'Add cluster' })).toBeDisabled;
  });

  it('allows updating form with valid values', () => {
    const initialProps = {
      isOpen: true,
    };

    const testInitialClusterValues = {
      clusterName: 'existing-clustername',
      clusterUrl: 'http://existing.example.com',
      clusterSvcToken: 'existing-token',
      clusterIsAzure: null,
      clusterAzureResourceGroup: null,
      clusterRequireSSL: null,
      clusterCABundle: null,
    };

    render(
      <Provider store={store}>
        <AddEditClusterModal {...initialProps} initialClusterValues={testInitialClusterValues} />
      </Provider>
    );

    expect(screen.getByDisplayValue('existing-clustername')).toBeInTheDocument;
    expect(screen.getByDisplayValue('http://existing.example.com')).toBeInTheDocument;
    expect(screen.getByDisplayValue('existing-token')).toBeInTheDocument;
    expect(screen.getByRole('button', { name: 'Add cluster' })).toBeEnabled;
  });
});
