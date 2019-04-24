import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../../common/ModalWrapper';
import AddClusterForm from './AddClusterForm';
import { clusterOperations } from '../../duck';
import { Creators } from '../../duck/actions';
import ConnectionState from '../../../common/connection_state';

class AddClusterModal extends React.Component<any, any> {
  componentDidMount() {
    this.props.resetConnectionState();
  }
  render() {
    const {

      trigger,
      addCluster,
      checkConnection,
      connectionState,
      onToggle,
    } = this.props;

    const onCloseHook = () => {
      this.props.resetConnectionState();

    };
    const onAddHook = (vals) => {
      addCluster(vals);
      onToggle();
    }
    return (
      <Modal
        onClose={onCloseHook}
        title="Add Cluster"
        trigger={trigger}
        form={
          <AddClusterForm
            connectionState={connectionState}
            onHandleModalToggle={onCloseHook}
            onAddItemSubmit={onAddHook}
            checkConnection={checkConnection}
          />}
      />
    );
  }
}

export default connect(
  state => {
    return {
      connectionState: state.cluster.connectionState,
    };
  },
  dispatch => ({
    checkConnection: () => dispatch(clusterOperations.checkConnection()),
    addCluster: values => dispatch(clusterOperations.addCluster(values)),
    resetConnectionState: () => dispatch(Creators.setConnectionState(ConnectionState.Pending)),
  }),
)(AddClusterModal);
