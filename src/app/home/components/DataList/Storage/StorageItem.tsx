import React, { useState, useContext } from 'react';
import {
  DataListAction,
  DataListItem,
  DataListCell,
  DataListItemCells,
  DataListItemRow,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import AddEditStorageModal from '../../../../storage/components/AddEditStorageModal';
import { useOpenModal } from '../../../duck/hooks';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { StorageContext } from '../../../duck/context';

const StorageItem = ({ storage, storageIndex, removeStorage, ...props }) => {
  const associatedPlanCount = props.associatedPlans[storage.MigStorage.metadata.name];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';
  const [isAddEditModalOpen, toggleIsAddEditModalOpen] = useOpenModal(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);
  const name = storage.MigStorage.metadata.name;
  const bucketName = storage.MigStorage.spec.backupStorageConfig.awsBucketName;
  const bucketRegion = storage.MigStorage.spec.backupStorageConfig.awsRegion;
  const s3Url = storage.MigStorage.spec.backupStorageConfig.awsS3Url;

  const accessKey =
    typeof storage.Secret === 'undefined'
      ? null
      : storage.Secret.data['aws-access-key-id']
        ? atob(storage.Secret.data['aws-access-key-id'])
        : '';
  const secret =
    typeof storage.Secret === 'undefined'
      ? null
      : storage.Secret.data['aws-secret-access-key']
        ? atob(storage.Secret.data['aws-secret-access-key'])
        : '';

  let storageStatus = null;
  if (storage.MigStorage.status) {
    storageStatus = storage.MigStorage.status.conditions.filter(c => c.type === 'Ready').length > 0;
  }
  const removeMessage = `Are you sure you want to remove "${name}"`;

  const handleRemoveStorage = isConfirmed => {
    if (isConfirmed) {
      removeStorage(name);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  const storageContext = useContext(StorageContext);

  const editStorage = () => {
    storageContext.watchStorageAddEditStatus(name);
    toggleIsAddEditModalOpen();
  };

  const [kebabIsOpen, setKebabIsOpen] = useState(false);

  const kebabDropdownItems = [
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        editStorage();
      }}
      key="editStorage"
    >
      Edit
    </DropdownItem>,
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        toggleConfirmOpen();
      }}
      key="removeStorage"
    >
      Remove
    </DropdownItem>,
  ];

  return (
    <DataListItem key={storageIndex} aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key={name} width={1}>
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  <span id="simple-item1">{name}</span>
                </div>
              </div>
            </DataListCell>,
            <DataListCell key="url" width={3}>
              {s3Url &&
                <a target="_blank" href={s3Url}>
                  {s3Url}
                </a>
              }
            </DataListCell>,
            <DataListCell key="count" width={2}>
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  {associatedPlanCount} associated migration {planText}
                </div>
              </div>
            </DataListCell>,
            <DataListCell key="connection" width={1}>
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  <StatusIcon isReady={storageStatus} />
                </div>
                <div className="pf-l-flex__item">
                  <span id="storage-status-text">{storageStatus ? `Connected` : `Connection Failed`}</span>
                </div>
              </div>
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby="storage-item storage-item-actions-dropdown"
          id="storage-item-actions-dropdown"
          aria-label="Actions"
        >
          <Dropdown
            toggle={<KebabToggle
              onToggle={() => setKebabIsOpen(!kebabIsOpen)}
            />}
            isOpen={kebabIsOpen}
            isPlain
            dropdownItems={kebabDropdownItems}
            position={DropdownPosition.right}
          />
          <AddEditStorageModal
            isOpen={isAddEditModalOpen}
            onHandleClose={toggleIsAddEditModalOpen}
            initialStorageValues={{
              name, bucketName, bucketRegion, accessKey, secret, s3Url,
            }}
          />
          <ConfirmModal
            message={removeMessage}
            isOpen={isConfirmOpen}
            onHandleClose={handleRemoveStorage}
            id="confirm-storage-removal"
          />
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};
export default StorageItem;
