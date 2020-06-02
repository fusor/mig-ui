import { render, fireEvent, screen } from '@testing-library/react';
import ResourceSelectForm from '../ResourceSelectForm';
import React, { useEffect } from 'react';
import { SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG } from 'constants';
import '@testing-library/jest-dom/extend-expect';

describe('<ResourceSelectForm />', () => {
  test('loads resource select form', async () => {
    const errors = {};
    const clusterList = [];
    const setFieldTouched = jest.fn();
    const setFieldValue = jest.fn();
    const fetchNamespacesRequest = jest.fn();

    const sourceClusterNamespaces = [];
    const storageList = [];
    const values = {
      planName: 'plan343',
      sourceCluster: 'src009',
      targetCluster: 'host',
      selectedNamespaces: ['ian-test-3'],
      selectedStorage: 'src5555',
      persistentVolumes: [],
      pvStorageClassAssignment: {},
      pvVerifyFlagAssignment: {},
      pvCopyMethodAssignment: {},
    };

    const { getByText, findByText } = render(
      <ResourceSelectForm
        errors={errors}
        touched={errors}
        values={values}
        clusterList={clusterList}
        fetchNamespacesRequest={fetchNamespacesRequest}
        isEdit
        isFetchingNamespaceList
        sourceClusterNamespaces={sourceClusterNamespaces}
        storageList={storageList}
        setFieldTouched={setFieldTouched}
        setFieldValue={setFieldValue}
      />
    );

    // Click button
    fireEvent.click(getByText('Source cluster'));

    // Wait for page to update with query text
    const Loader = await findByText(/Loading/);
    expect(Loader).toHaveTextContent('Loading');
    // expect(screen.findByText('Loading')).toHaveTextContent('Loading');
    // .toHaveAttribute('disabled')
    // screen.findByText
  });
});
