import React, { useState, useContext } from 'react';
import {
  Tooltip,
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
} from '@patternfly/react-core';
import AddEditTokenModal from '../../../../common/components/AddEditTokenModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { useOpenModal } from '../../../duck';
// import { tokenContext } from '../../../duck/context';
import { ITokenInfo } from '../helpers';
import { IToken, IMigToken } from '../../../../token/duck/types';

interface ITokenActionsDropdownProps {
  token: IToken;
  removeToken: (tokenName: string) => void;
  toggleAddEditModal: () => void;
  associatedClusterName: string;
  watchTokenAddEditStatus: (name: string) => void;
}

const TokenActionsDropdown: React.FunctionComponent<ITokenActionsDropdownProps> = ({
  token,
  removeToken,
  associatedClusterName,
  toggleAddEditModal,
  watchTokenAddEditStatus,
}: ITokenActionsDropdownProps) => {
  const { name } = token.MigToken.metadata;

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);
  const [initialTokenValues, setInitialTokenValues] = useState<Partial<IToken>>({});

  const handleRemoveToken = (isConfirmed) => {
    if (isConfirmed) {
      removeToken(name);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  // const tokenContext = useContext(tokenContext);

  // const edittoken = () => {
  //   tokenContext.watchtokenAddEditStatus(tokenName);
  //   toggleIsAddEditOpen();
  // };
  const isRemoveDisabled = token.isAssociatedPlans;
  const removeItem = (
    <DropdownItem
      isDisabled={isRemoveDisabled}
      onClick={() => {
        setKebabIsOpen(false);
        toggleConfirmOpen();
      }}
      key="removeToken"
    >
      Remove
    </DropdownItem>
  );

  console.log(token);

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            isDisabled={false}
            onClick={() => {
              setKebabIsOpen(false);
              toggleAddEditModal();
              setInitialTokenValues(token);
              watchTokenAddEditStatus(name);
              // editToken();
            }}
            key="editToken"
          >
            Edit
          </DropdownItem>,
          isRemoveDisabled ? (
            <Tooltip
              position="top"
              content={<div>Token is associated with a plan and cannot be removed.</div>}
              key="removeTokenTooltip"
            >
              {removeItem}
            </Tooltip>
          ) : (
            removeItem
          ),
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        title="Remove this token?"
        message={`Removing "${name}" will make it unavailable for migration plans`}
        isOpen={isConfirmOpen}
        onHandleClose={handleRemoveToken}
        id="confirm-token-removal"
      />
    </>
  );
};

export default TokenActionsDropdown;
