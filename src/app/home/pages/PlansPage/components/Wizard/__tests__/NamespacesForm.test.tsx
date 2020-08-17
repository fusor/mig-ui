import React, { Children } from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import WizardFormik, { IWizardFormikProps } from '../WizardFormik';
import { defaultInitialValues, IFormValues } from '../WizardContainer';

import NamespacesForm from '../NamespacesForm';

describe('<NamespacesForm />', () => {
  it('display loading heading', () => {
    const initialFormikProps: IWizardFormikProps = {
      initialValues: defaultInitialValues,
      isEdit: false,
      planList: [],
      children: Children,
    };

    const initialNamespaceProps = {
      isFetchingNamespaceList: true,
      fetchNamespacesRequest: jest.fn(),
      sourceClusterNamespaces: [],
    };

    render(
      <WizardFormik {...initialFormikProps}>
        <NamespacesForm {...initialNamespaceProps} />
      </WizardFormik>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Loading...');
    expect(initialNamespaceProps.fetchNamespacesRequest).toHaveBeenCalledTimes(1);
    expect(initialNamespaceProps.fetchNamespacesRequest).toHaveBeenCalledWith(null);
  });

  it('displays namespaces', () => {
    const initialFormikProps: IWizardFormikProps = {
      initialValues: { ...defaultInitialValues, sourceCluster: 'src-cluster' },
      planList: [],
      children: Children,
    };

    const initialNamespaceProps = {
      isFetchingNamespaceList: false,
      fetchNamespacesRequest: jest.fn(),
      sourceClusterNamespaces: [
        {
          name: 'namespace1',
          podCount: 3,
          pvcCount: 4,
          serviceCount: 5,
        },
        {
          name: 'namespace2',
          podCount: 4,
          pvcCount: 5,
          serviceCount: 6,
        },
      ],
    };

    render(
      <WizardFormik {...initialFormikProps}>
        <NamespacesForm {...initialNamespaceProps} />
      </WizardFormik>
    );

    initialNamespaceProps.sourceClusterNamespaces.forEach((namespace) => {
      const row = screen.getByText(namespace.name).closest('tr');
      const utils = within(row);

      expect(utils.getByText(namespace.name)).toBeInTheDocument();
      expect(utils.getByText(namespace.podCount.toString())).toBeInTheDocument();
      expect(utils.getByText(namespace.pvcCount.toString())).toBeInTheDocument();
      expect(utils.getByText(namespace.serviceCount.toString())).toBeInTheDocument();
    });

    expect(initialNamespaceProps.fetchNamespacesRequest).toHaveBeenCalledTimes(1);
    expect(initialNamespaceProps.fetchNamespacesRequest).toHaveBeenCalledWith('src-cluster');
  });
});
