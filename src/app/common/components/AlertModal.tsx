import React from 'react';
import { Alert, AlertActionCloseButton, AlertProps } from '@patternfly/react-core';
const styles = require('./AlertModal.module').default;

interface IProps {
  alertMessage: string;
  alertType: AlertProps['variant'];
  clearAlerts: () => null;
}

const AlertModal: React.FunctionComponent<IProps> = ({ alertMessage, alertType, clearAlerts }) => {
  if (!alertMessage) {
    return null;
  }

  return (
    <div className={styles.notiContainer}>
      <Alert
        variant={alertType}
        title={alertMessage}
        actionClose={<AlertActionCloseButton onClose={clearAlerts} />}
      />
    </div>
  );
};
export default AlertModal;
