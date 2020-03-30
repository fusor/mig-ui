import React, { useState, useEffect } from 'react';
import VolumesTable from './VolumesTable';
import {
  Grid,
  GridItem,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
  Alert,
} from '@patternfly/react-core';
import StatusIcon from '../../../common/components/StatusIcon';
const styles = require('./VolumesTable.module');

const VolumesForm = props => {
  // TODO add a typescript interface for these props
  const {
    setFieldValue,
    values,
    isPVError,
    currentPlan,
    currentPlanStatus,
    getPVResourcesRequest,
    pvResourceList,
    isFetchingPVResources,
    isEdit,
    planUpdateRequest,
    isPollingStatus,
  } = props;

  const [rows, setRows] = useState([]); // TODO do we need state here? can we use redux+formik?

  const updateTableData = (rowIndex, updatedValue) => {
    const rowsCopy = [...rows];
    if (currentPlan !== null && values.persistentVolumes) {
      const updatedRow = { ...rowsCopy[rowIndex], type: updatedValue };

      rowsCopy[rowIndex] = updatedRow;
    }

    setRows(rowsCopy);
    setFieldValue('persistentVolumes', rowsCopy);
  };

  useEffect(() => {
    //kick off pv discovery once volumes form is reached with current selected namespaces
    let isRerunPVDiscovery = null;
    if (currentPlan) {
      isRerunPVDiscovery = true;
      planUpdateRequest(values, isRerunPVDiscovery);
    } else {
      planUpdateRequest(values, isRerunPVDiscovery);
    }
  }, []);

  const discoveredPersistentVolumes = (currentPlan && currentPlan.spec.persistentVolumes) || [];

  useEffect(() => {
    if (discoveredPersistentVolumes.length > 0) {
      getPVResourcesRequest(discoveredPersistentVolumes, values.sourceCluster || '');
      let mappedPVs;
      if (values.persistentVolumes) {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const rowVal = values.persistentVolumes.find(v => v.name === planVolume.name);
            if (rowVal && rowVal.selection) {
              pvAction = rowVal.selection.action;
            } else {
              if (rowVal && rowVal.type) {
                pvAction = rowVal.type;
              }
            }
          }
          return {
            name: planVolume.name,
            project: planVolume.pvc.namespace,
            storageClass: planVolume.storageClass || 'None',
            size: planVolume.capacity,
            claim: planVolume.pvc.name,
            type: pvAction,
            details: '',
            supportedActions: planVolume.supported.actions,
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          const pvAction = 'copy'; // Default to copy
          return {
            name: planVolume.name,
            project: planVolume.pvc.namespace,
            storageClass: planVolume.storageClass || '',
            size: planVolume.capacity,
            claim: planVolume.pvc.name,
            type: pvAction,
            details: '',
            supportedActions: planVolume.supported.actions,
          };
        });
      }
      setFieldValue('persistentVolumes', mappedPVs);
      setRows(mappedPVs); // ???
    }
  }, [discoveredPersistentVolumes.length]); // Only re-run the effect if fetching value changes

  //TODO: added this component level error state to handle the case of no PVs
  // showing up after 3 checks of the interval. When the isPVError flag is checked,
  // the volumes form will show this error. Need to add redux actions & state to encapsulate
  // validation so that this error state enables the user to go to next page( that possibly
  // shows a different set of forms catered to stateless apps)

  if (isPVError) {
    return (
      <Grid gutter="md" className={styles.centerAlign}>
        <GridItem>
          <div className={styles.errorDiv}>
            <StatusIcon isReady={false} />
            PV Discovery Error
          </div>
        </GridItem>
      </Grid>
    );
  }
  if (isPollingStatus || currentPlanStatus.state === 'Pending') {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
          <Title headingLevel="h2" size="xl">
            Discovering persistent volumes attached to source projects...
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }
  if (currentPlanStatus.state === 'Critical') {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <Alert variant="danger" isInline title={currentPlanStatus.errorMessage} />
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <VolumesTable
      isEdit={isEdit}
      pvResourceList={pvResourceList}
      isFetchingPVResources={isFetchingPVResources}
      rows={rows}
      updateTableData={updateTableData}
    />
  );
};
export default VolumesForm;
