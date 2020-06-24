import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Bullseye,
  Card,
  PageSection,
  TextContent,
  Text,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  Spinner,
} from '@patternfly/react-core';
import { WrenchIcon, AddCircleOIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import clusterSelectors from '../../../cluster/duck/selectors';
import TokensTable from './components/TokensTable';
import { useOpenModal } from '../../duck';
import { IReduxState } from '../../../../reducers';
import { IToken } from '../../../token/duck/types';
import { ICluster } from '../../../cluster/duck/types';
import AddEditTokenModal from '../../../common/components/AddEditTokenModal';

interface ITokensPageBaseProps {
  tokenList: IToken[];
  clusterList: ICluster[];
  isFetchingInitialTokens: boolean;
}

const TokensPageBase: React.FunctionComponent<ITokensPageBaseProps> = ({
  tokenList,
  clusterList,
  isFetchingInitialTokens,
}: //NATODO: implement loading state for tokens
ITokensPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);

  const renderTokenCardBody = () => {
    if (clusterList.length === 0) {
      return (
        <EmptyState variant="full">
          <EmptyStateIcon icon={WrenchIcon} />
          <Title size="lg">No clusters have been added</Title>
          <TextContent className={spacing.mtMd}>
            <Text component="p">
              An administrator must add clusters for migration before you can add tokens. Contact
              the cluster administrator for assistance.
            </Text>
          </TextContent>
        </EmptyState>
      );
    } else if (tokenList.length === 0) {
      return (
        <EmptyState variant="full">
          <EmptyStateIcon icon={AddCircleOIcon} />
          <Title size="lg">Add token</Title>
          <Button onClick={toggleAddEditModal} variant="primary">
            Add token
          </Button>
        </EmptyState>
      );
    }
    return <TokensTable tokenList={tokenList} toggleAddEditModal={toggleAddEditModal} />;
  };

  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Tokens
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        {isFetchingInitialTokens ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              {/* NATODO add a TokenContext provider here when we wire up watchAddEditStatus */}
              {renderTokenCardBody()}
              {isAddEditModalOpen && <AddEditTokenModal onClose={toggleAddEditModal} />}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  tokenList: state.token.tokenList,
  clusterList: clusterSelectors.getAllClusters(state),
  isFetchingInitialTokens: state.token.isFetchingInitialTokens,
});

const mapDispatchToProps = (dispatch) => ({});

export const TokensPage = connect(mapStateToProps, mapDispatchToProps)(TokensPageBase);
