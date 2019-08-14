/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditStorageForm from './AddEditStorageForm';
import { StorageActions } from '../../duck/actions';
import { Modal } from '@patternfly/react-core';
import { PollingContext } from '../../../home/duck/context';
import { AddEditMode, defaultAddEditStatus } from '../../../common/add_edit_state';

const AddEditStorageModal = ({
  addEditStatus,
  initialStorageValues,
  isOpen,
  isPolling,
  ...props
}) => {
  const pollingContext = useContext(PollingContext);
  const onAddEditSubmit = (storageValues) => {
    switch(addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateStorage(storageValues);
        break;
      }
      case AddEditMode.Add: {
        props.addStorage(storageValues);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`, );
      }
    }
  };

  useEffect(() => {
    if(isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const onClose = () => {
    props.cancelAddEditWatch();
    props.resetAddEditState();
    props.onHandleClose();
    pollingContext.startAllDefaultPolling();
  };


  const modalTitle = addEditStatus.mode === AddEditMode.Edit ?
    'Edit Repository' : 'Add Repository';

  return (
    <Modal isSmall isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <AddEditStorageForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialStorageValues={initialStorageValues}
      />
    </Modal>
  );
};

export default connect(
  state => {
    return {
      addEditStatus: state.storage.addEditStatus,
      isPolling: state.storage.isPolling,
    };
  },
  dispatch => ({
    addStorage: storageValues => dispatch(StorageActions.addStorageRequest(storageValues)),
    updateStorage: updatedStorageValues => dispatch(
      StorageActions.updateStorageRequest(updatedStorageValues)),
    cancelAddEditWatch: () => dispatch(StorageActions.cancelWatchStorageAddEditStatus()),
    resetAddEditState: () => {
      dispatch(StorageActions.setStorageAddEditStatus(defaultAddEditStatus()));
    },
  })
)(AddEditStorageModal);
