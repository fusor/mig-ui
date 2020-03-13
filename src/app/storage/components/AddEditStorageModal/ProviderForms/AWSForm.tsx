import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  Tooltip,
  TooltipPosition,
  Checkbox,
  Grid,
  GridItem
} from '@patternfly/react-core';
import KeyDisplayIcon from '../../../../common/components/KeyDisplayIcon';
import HideWrapper from '../../../../common/components/HideWrapper';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
  isCheckConnectionButtonDisabled,
} from '../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../common/components/ConnectionStatusLabel';
import CertificateUpload from '../../../../common/components/CertificateUpload';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { withFormik, FormikProps } from 'formik';
import utils from '../../../../common/duck/utils';
import storageUtils from '../../../duck/utils';
import commonUtils from '../../../../common/duck/utils';

const componentTypeStr = 'Repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

const valuesHaveUpdate = (values, currentStorage) => {
  if (!currentStorage) { return true; }

  const existingMigStorageName = currentStorage.MigStorage.metadata.name;
  const existingAWSBucketName = currentStorage.MigStorage.spec.backupStorageConfig.awsBucketName;
  const existingAWSBucketRegion = currentStorage.MigStorage.spec.backupStorageConfig.awsRegion || '';
  const existingBucketUrl = currentStorage.MigStorage.spec.backupStorageConfig.awsS3Url || '';
  const existingRequireSSL = !currentStorage.MigStorage.spec.backupStorageConfig.insecure;
  const existingCABundle = !currentStorage.MigStorage.spec.backupStorageConfig.s3CustomCABundle;
  let existingAccessKeyId;
  if (currentStorage.Secret.data['aws-access-key-id']) {
    existingAccessKeyId = atob(currentStorage.Secret.data['aws-access-key-id']);
  }

  let existingSecretAccessKey;
  if (currentStorage.Secret.data['aws-secret-access-key-id']) {
    existingSecretAccessKey = atob(currentStorage.Secret.data['aws-secret-access-key']);
  }


  const valuesUpdatedObject =
    values.name !== existingMigStorageName ||
    values.awsBucketName !== existingAWSBucketName ||
    values.bucketRegion !== existingAWSBucketRegion ||
    values.s3Url !== existingBucketUrl ||
    values.accessKey !== existingAccessKeyId ||
    values.secret !== existingSecretAccessKey ||
    values.requireSSL !== existingRequireSSL ||
    values.caBundle !== existingCABundle;

  return valuesUpdatedObject;
};

interface IFormValues {
  name: string;
  awsBucketName: string;
  awsBucketRegion: string;
  accessKey: string;
  secret: string;
  s3Url: string;
  bslProvider: string;
  requireSSL: boolean;
  caBundle: string;
}
interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  initialStorageValues: any;
  checkConnection: (name) => void;
  currentStorage: any;
  provider: string;
}

const InnerAWSForm = (props: IOtherProps & FormikProps<IFormValues>) => {

  const {
    addEditStatus: currentStatus,
    currentStorage,
    checkConnection,
    values,
    touched,
    errors,
    handleChange,
    setFieldTouched,
    setFieldValue,
    onClose,
    handleSubmit,
    handleBlur

  } = props;
  const nameKey = 'name';
  const s3UrlKey = 's3Url';
  const awsBucketNameKey = 'awsBucketName';
  const awsBucketRegionKey = 'awsBucketRegion';
  const accessKeyKey = 'accessKey';
  const secretKey = 'secret';
  const vslConfigKey = 'vslConfig';
  const vslBlobKey = 'vslBlob';
  const requireSSLKey = 'requireSSL';
  const caBundleKey = 'caBundle';

  const [isAccessKeyHidden, setIsAccessKeyHidden] = useState(true);
  const [isSharedCred, setIsSharedCred] = useState(true);

  const handleAccessKeyHiddenToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsAccessKeyHidden(!isAccessKeyHidden);
  };
  const [isSecretHidden, setIsSecretHidden] = useState(true);
  const handleSecretHiddenToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsSecretHidden(!isSecretHidden);
  };

  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = key => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup
        label="Replication repository name"
        isRequired
        fieldId={nameKey}
        helperTextInvalid={touched.name && errors.name}
        isValid={!(touched.name && errors.name)}
      >
        {/*
        // @ts-ignore */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(nameKey)}
          onBlur={handleBlur}
          value={values.name}
          name={nameKey}
          type="text"
          id="storage-name-input"
          isDisabled={currentStatus.mode === AddEditMode.Edit}
          isValid={!(touched.name && errors.name)}
        />
      </FormGroup>
      <FormGroup
        label="S3 bucket name"
        isRequired
        fieldId={awsBucketNameKey}
        helperTextInvalid={touched.awsBucketName && errors.awsBucketName}
        isValid={!(touched.awsBucketName && errors.awsBucketName)}
      >
        {/*
        // @ts-ignore */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(awsBucketNameKey)}
          onBlur={handleBlur}
          value={values.awsBucketName}
          name={awsBucketNameKey}
          type="text"
          id="storage-bucket-name-input"
          isValid={!(touched.awsBucketName && errors.awsBucketName)}
        />
      </FormGroup>
      <FormGroup
        label="S3 bucket region"
        fieldId={awsBucketRegionKey}
        helperTextInvalid={touched.awsBucketRegion && errors.awsBucketRegion}
        isValid={!(touched.awsBucketRegion && errors.awsBucketRegion)}
      >
        {/*
        // @ts-ignore */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(awsBucketRegionKey)}
          onBlur={handleBlur}
          value={values.awsBucketRegion}
          name={awsBucketRegionKey}
          type="text"
          id="storage-bucket-region-input"
          isValid={!(touched.awsBucketRegion && errors.awsBucketRegion)}
        />
      </FormGroup>
      <FormGroup
        label="S3 endpoint"
        fieldId={s3UrlKey}
        helperTextInvalid={touched.s3Url && errors.s3Url}
        isValid={!(touched.s3Url && errors.s3Url)}
      >
        {/*
        // @ts-ignore */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(s3UrlKey)}
          onBlur={handleBlur}
          value={values.s3Url}
          name={s3UrlKey}
          type="text"
          id="storage-s3-url-input"
          isValid={!(touched.s3Url && errors.s3Url)}
        />
      </FormGroup>
      <FormGroup
        label="S3 provider access key"
        isRequired
        fieldId={accessKeyKey}
        helperTextInvalid={touched.accessKey && errors.accessKey}
        isValid={!(touched.accessKey && errors.accessKey)}
      >
        <HideWrapper onClick={handleAccessKeyHiddenToggle}>
          <KeyDisplayIcon id="accessKeyIcon" isHidden={isAccessKeyHidden} />
        </HideWrapper>
        {/*
        // @ts-ignore */}

        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(accessKeyKey)}
          onBlur={handleBlur}
          value={values.accessKey}
          name={accessKeyKey}
          type={isAccessKeyHidden ? 'password' : 'text'}
          id="storage-access-key-input"
          isValid={!(touched.accessKey && errors.accessKey)}
        />
      </FormGroup>
      <FormGroup
        label="S3 provider secret access key"
        isRequired
        fieldId={secretKey}
        helperTextInvalid={touched.secret && errors.secret}
        isValid={!(touched.secret && errors.secret)}
      >
        <HideWrapper onClick={handleSecretHiddenToggle}>
          <KeyDisplayIcon id="accessKeyIcon" isHidden={isSecretHidden} />
        </HideWrapper>
        {/*
          // @ts-ignore */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(secretKey)}
          onBlur={handleBlur}
          value={values.secret}
          name={secretKey}
          type={isSecretHidden ? 'password' : 'text'}
          id="storage-secret-input"
          isValid={!(touched.secret && errors.secret)}
        />
      </FormGroup>
      <FormGroup fieldId={requireSSLKey}>
        <Checkbox
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(requireSSLKey)}
          onBlur={handleBlur}
          isChecked={values.requireSSL}
          name={requireSSLKey}
          label="Require SSL verification"
          id="require-ssl-input"
        />
      </FormGroup>
      <FormGroup label="CA Bundle file" fieldId={caBundleKey}>
        <CertificateUpload
          isDisabled={!values.requireSSL}
          name={caBundleKey}
          setFieldValue={setFieldValue}
          onInput={formikSetFieldTouched(caBundleKey)}
          onBlur={handleBlur}
        />
      </FormGroup>
      <Grid gutter="md">
        <GridItem >
          <Button
            type="submit"
            isDisabled={isAddEditButtonDisabled(
              currentStatus, errors, touched, valuesHaveUpdate(values, currentStorage)
            )}
            style={{ marginRight: '10px' }}
          >
            {addEditButtonTextFn(currentStatus)}
          </Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Add or edit your storage details
            </div>}>
            <span className="pf-c-icon">
              <OutlinedQuestionCircleIcon />
            </span>
          </Tooltip>
          <Button
            style={{ marginLeft: '10px', marginRight: '10px' }}
            isDisabled={isCheckConnectionButtonDisabled(
              currentStatus, valuesHaveUpdate(values, currentStorage),
            )}
            onClick={() => checkConnection(values.name)}
          >
            Check Connection
          </Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Re-check your storage connection state
            </div>}><OutlinedQuestionCircleIcon />
          </Tooltip>
        </GridItem>
        <GridItem>
          <ConnectionStatusLabel
            status={currentStatus}
            statusText={currentStatusFn(currentStatus)}
          />
        </GridItem>
        <GridItem>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </GridItem>
      </Grid>
    </Form>
  );
};

// valuesHaveUpdate - returns true if the formik values hold values that differ
// from a matching existing replication repository. This is different from props.dirty, which returns
// true when the form values differ from the initial values. It's possible to have
// a storage object exist, but have no initial values (user adds new storage, then updates
// while keeping the modal open). props.dirty is not sufficient for this case.


const AWSForm: any = withFormik({
  mapPropsToValues: ({ initialStorageValues, provider }) => {
    const values = {
      name: '',
      awsBucketName: '',
      awsBucketRegion: '',
      accessKey: '',
      secret: '',
      s3Url: '',
      bslProvider: provider,
      requireSSL: true,
      caBundle: '',
    };

    if (initialStorageValues) {
      values.name = initialStorageValues.name || '';
      values.awsBucketName = initialStorageValues.awsBucketName || '';
      values.awsBucketRegion = initialStorageValues.awsBucketRegion || '';
      values.accessKey = initialStorageValues.accessKey || '';
      values.secret = initialStorageValues.secret || '';
      values.s3Url = initialStorageValues.s3Url || '';
      values.requireSSL = initialStorageValues.requireSSL;
      values.caBundle = initialStorageValues.caBundle || null;
      // values.bslProvider = provider;
    }

    return values;
  },

  validate: (values: any) => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }

    if (!values.awsBucketName) {
      errors.awsBucketName = 'Required';
    }

    const awsBucketNameError = storageUtils.testS3Name(values.awsBucketName);
    if (awsBucketNameError !== '') {
      errors.awsBucketName = awsBucketNameError;
    }

    if (!values.awsBucketName) {
      errors.awsBucketName = 'Required';
    }

    if (values.s3Url !== '') {
      const s3UrlError = commonUtils.testURL(values.s3Url) ?
        '' : 'S3 Endpoint must be a valid URL.';
      if (s3UrlError !== '') {
        errors.s3Url = s3UrlError;
      }
    }

    if (!values.accessKey) {
      errors.accessKey = 'Required';
    }

    if (!values.secret) {
      errors.secret = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAWSForm);

export default AWSForm;
