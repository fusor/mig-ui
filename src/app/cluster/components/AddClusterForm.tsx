import React from 'react';
import { withFormik } from 'formik';
import { Flex, Box, Text } from '@rebass/emotion';
import {
  Button,
  TextInput,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
} from '@patternfly/react-core';
import { IMigCluster, IClusterFormObject } from '../../../models';
import uuidv4 from 'uuid/v4';

const WrappedAddClusterForm = props => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;
  return (
    <Flex>
      <form onSubmit={handleSubmit}>
        <Box>
          <TextContent>
            <TextList component="dl">
              <TextListItem component="dt">Cluster Name</TextListItem>
              <input
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                name="name"
                type="text"
              />
              {errors.name && touched.name && (
                <div id="feedback">{errors.name}</div>
              )}
              <TextListItem component="dt">Cluster URL</TextListItem>
              <input
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.url}
                name="url"
                type="text"
              />
              {errors.url && touched.url && (
                <div id="feedback">{errors.url}</div>
              )}
              <TextListItem component="dt">Service account token</TextListItem>
              <textarea
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.token}
                name="token"
              />
              {errors.token && touched.token && (
                <div id="feedback">{errors.token}</div>
              )}
            </TextList>
          </TextContent>
        </Box>
        <Box>
          <Flex>
            <Box m="10px 10px 10px 0">
              <Button
                key="cancel"
                variant="secondary"
                onClick={() => props.onHandleModalToggle(null)}
              >
                Cancel
              </Button>
            </Box>
            <Box m={10}>
              <Button variant="secondary" type="submit">
                Add
              </Button>
            </Box>
          </Flex>
        </Box>
      </form>
    </Flex>
  );
};

const AddClusterForm: any = withFormik({
  mapPropsToValues: () => ({ name: '', url: '', token: '' }),

  validate: values => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    }

    if (!values.url) {
      errors.url = 'Required';
    }

    if (!values.token) {
      errors.token = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    formikBag.setSubmitting(false);
    formikBag.props.onHandleModalToggle();
    formikBag.props.onAddItemSubmit('cluster', values);
  },

  displayName: 'Add Cluster Form',
})(WrappedAddClusterForm);

export default AddClusterForm;
