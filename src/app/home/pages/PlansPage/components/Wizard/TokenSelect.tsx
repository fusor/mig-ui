import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { FormGroup, Button, Level, LevelItem, Flex, FlexItem } from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flexStyles from '@patternfly/react-styles/css/layouts/Flex/flex';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import AddEditTokenModal from '../../../../../common/components/AddEditTokenModal';
import IconWithText from '../../../../../common/components/IconWithText';
import { IToken } from '../../../../../token/duck/types';
import { useOpenModal } from '../../../../duck/hooks';
import { getTokenInfo } from '../../../TokensPage/helpers';
import StatusIcon, { StatusType } from '../../../../../common/components/StatusIcon';
import { INameNamespaceRef } from '../../../../../common/duck/types';
import { FormikTouched, FormikErrors } from 'formik';
import { IReduxState } from '../../../../../../reducers';
import { IMigMeta } from '../../../../../../mig_meta';
const styles = require('./TokenSelect.module');

interface ITokenSelectProps {
  fieldId: string;
  tokenList: IToken[];
  clusterName: string;
  value: string;
  onChange: (tokenRef: INameNamespaceRef) => void;
  touched: FormikTouched<INameNamespaceRef>;
  error?: FormikErrors<INameNamespaceRef>;
  expiringSoonMessage: string;
  expiredMessage: string;
  migMeta: IMigMeta;
}

const getTokenOptionsForCluster = (
  tokenList: IToken[],
  clusterName: string,
  onAddTokenClick: () => void
): OptionWithValue[] => {
  const empty: OptionWithValue = {
    toString: () => 'No tokens found for the selected cluster',
    value: null,
    props: {
      component: 'span',
      isDisabled: true,
      children: (
        <>
          <span>No tokens found for the selected cluster.</span>
          <Button
            variant="link"
            isInline
            className={`${styles.addTokenOptionLink} ${spacing.mtSm} ${spacing.mbSm}`}
            onClick={onAddTokenClick}
          >
            Add token
          </Button>
        </>
      ),
    },
  };
  if (!clusterName || !tokenList) return [empty];
  const availableTokens = tokenList.filter(
    (token) => token.MigToken.spec.migClusterRef.name === clusterName
  );
  if (availableTokens.length === 0) return [empty];
  return availableTokens.map((token) => {
    const { statusType } = getTokenInfo(token);
    return {
      toString: () => token.MigToken.metadata.name,
      value: token.MigToken.metadata.name,
      props: {
        children: (
          <Level>
            <LevelItem>{token.MigToken.metadata.name}</LevelItem>
            <LevelItem>
              {statusType !== StatusType.OK && (
                <StatusIcon status={statusType} className={spacing.mlSm} />
              )}
            </LevelItem>
          </Level>
        ),
      },
    };
  });
};

const getSelectedTokenOption = (tokenName: string, tokenOptions: OptionWithValue[]) => {
  if (!tokenName) return null;
  return tokenOptions.find((option) => option.value === tokenName);
};

const TokenSelect: React.FunctionComponent<ITokenSelectProps> = ({
  fieldId,
  tokenList,
  clusterName,
  value,
  onChange,
  touched,
  error,
  expiringSoonMessage,
  expiredMessage,
  migMeta,
}: ITokenSelectProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const [tokenJustCreatedRef, setTokenJustCreatedRef] = useState<INameNamespaceRef>(null);

  const handleChange = (tokenName: string) => {
    // NATODO should we include the namespace from the MigToken in the select options and everything, to be future proof?
    onChange({ name: tokenName, namespace: migMeta.namespace });
  };

  const onAddTokenClick = () => {
    setTokenJustCreatedRef(null);
    toggleAddEditModal();
  };

  const tokenOptions = getTokenOptionsForCluster(tokenList, clusterName, onAddTokenClick);

  useEffect(() => {
    // If there's only one token available for the cluster, pre-select it.
    if (!value && tokenOptions.length === 1 && tokenOptions[0].value !== null) {
      handleChange(tokenOptions[0].value);
    }
  }, [tokenList, clusterName]);

  const selectedToken: IToken = value
    ? tokenList.find((token) => token.MigToken.metadata.name === value)
    : null;
  const selectedTokenInfo = selectedToken && getTokenInfo(selectedToken);

  const newToken: IToken =
    tokenJustCreatedRef &&
    tokenList.find((token) => {
      const { name, namespace } = token.MigToken.metadata;
      return name === tokenJustCreatedRef.name && namespace === tokenJustCreatedRef.namespace;
    });
  const isLoadingNewToken = !!tokenJustCreatedRef && !newToken;

  console.log({ tokenJustCreatedRef, newToken, selectedToken, tokenList });

  useEffect(() => {
    if (newToken && !selectedToken) {
      console.log('NEW TOKEN LOADED!');
      if (newToken.MigToken.spec.migClusterRef.name === clusterName) {
        // The token we just created is in memory now and matches the selected cluster, so select it.
        console.log('SELECTING IT!');
        handleChange(newToken.MigToken.metadata.name);
      } else {
        // It's not associated with the selected cluster, so give up on selecting it.
        console.log('GIVING UP!');
        setTokenJustCreatedRef(null);
      }
    }
  }, [newToken]);

  useEffect(() => {
    // Clear any messages about freshly created tokens if the cluster selection changes
    setTokenJustCreatedRef(null);
  }, [clusterName]);

  return (
    <>
      <FormGroup
        className={spacing.mtMd}
        label="Authentication token"
        isRequired
        fieldId={fieldId}
        helperTextInvalid={touched && error}
        isValid={!(touched && error)}
      >
        <SimpleSelect
          id={fieldId}
          onChange={(selection: OptionWithValue) => {
            if (selection.value) {
              handleChange(selection.value);
              setTokenJustCreatedRef(null);
            }
          }}
          options={tokenOptions}
          value={getSelectedTokenOption(value, tokenOptions)}
          placeholderText="Select token..."
          isDisabled={!clusterName || isLoadingNewToken}
        />
        <AddEditTokenModal
          isOpen={isAddEditModalOpen}
          onClose={toggleAddEditModal}
          onTokenCreated={(tokenName: string) => {
            // NATODO should we include the namespace from the MigToken in the select options and everything, to be future proof?
            setTokenJustCreatedRef({ name: tokenName, namespace: migMeta.namespace });
          }}
          preSelectedClusterName={clusterName}
        />
      </FormGroup>
      {isLoadingNewToken && <div className={spacing.mSm}>Loading...</div>}
      {newToken && newToken === selectedToken && (
        <div className={spacing.mSm}>
          <IconWithText
            icon={
              <span className="pf-c-icon pf-m-success">
                <CheckIcon />
              </span>
            }
            text="Token associated"
          />
        </div>
      )}
      {selectedTokenInfo && selectedTokenInfo.statusType === StatusType.WARNING && (
        <Flex className={`${spacing.mSm} ${flexStyles.modifiers.alignItemsCenter}`}>
          <FlexItem>
            <StatusIcon status={StatusType.WARNING} />
          </FlexItem>
          <FlexItem>
            {expiringSoonMessage}
            <br />
            <Button variant="link" isInline onClick={() => alert('NATODO: not yet implemented')}>
              Regenerate
            </Button>
          </FlexItem>
        </Flex>
      )}
      {selectedTokenInfo && selectedTokenInfo.statusType === StatusType.ERROR && (
        <Flex className={`${spacing.mSm} ${flexStyles.modifiers.alignItemsCenter}`}>
          <FlexItem>
            <StatusIcon status={StatusType.ERROR} />
          </FlexItem>
          <FlexItem>
            {expiredMessage}
            <br />
            <Button variant="link" isInline onClick={() => alert('NATODO: not yet implemented')}>
              Regenerate
            </Button>
          </FlexItem>
        </Flex>
      )}
    </>
  );
};

const mapStateToProps = (state: IReduxState): Partial<ITokenSelectProps> => ({
  migMeta: state.migMeta,
  tokenList: state.token.tokenList,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TokenSelect);
