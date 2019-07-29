/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
// import StorageClassTable from './StorageClassTable';
import styled from '@emotion/styled';
const StorageClassForm = props => {
  const { setFieldValue, values, planList } = props;
  const StyledTextContent = styled(TextContent)`
    margin: 1em 0 1em 0;
  `;
  return (
    <React.Fragment>
      <Box>
        <StyledTextContent>
          <TextList component="dl">
            <TextListItem component="dt">Select storage class for copied PVs:</TextListItem>
          </TextList>
        </StyledTextContent>
        {/* <StorageClassTable planList={planList} setFieldValue={setFieldValue} values={values} /> */}
      </Box>
    </React.Fragment>
  );
};
export default StorageClassForm;
