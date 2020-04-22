import React, { useState, useEffect, useContext } from 'react';
import { Wizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import ResourceSelectForm from './ResourceSelectForm';
import VolumesForm from './VolumesForm';
import CopyOptionsForm from './CopyOptionsForm';
import HooksStep from './HooksStep';
import ResultsStep from './ResultsStep';
import { PollingContext } from '../../../home/duck/context';
import { FormikProps } from 'formik';
import { IOtherProps, IFormValues } from './WizardContainer';
import { CurrentPlanState } from '../../duck/reducers';
import WizardStepContainer from './WizardStepContainer';

const styles = require('./WizardComponent.module');

const WizardComponent = (props: IOtherProps & FormikProps<IFormValues>) => {
  const [stepIdReached, setStepIdReached] = useState(1);
  const [updatedSteps, setUpdatedSteps] = useState([]);
  const pollingContext = useContext(PollingContext);
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    setFieldTouched,
    setFieldValue,
    resetForm,
    clusterList,
    currentPlan,
    currentPlanStatus,
    storageList,
    isOpen,
    isFetchingPVList,
    isFetchingNamespaceList,
    isPVError,
    isPollingStatus,
    fetchNamespacesRequest,
    sourceClusterNamespaces,
    fetchHooksRequest,
    migHookList,
    isFetchingHookList,
    getPVResourcesRequest,
    startPlanStatusPolling,
    stopPlanStatusPolling,
    planUpdateRequest,
    pvResourceList,
    addPlanRequest,
    setCurrentPlan,
    resetCurrentPlan,
    onHandleWizardModalClose,
    isEdit,
    editPlanObj,
    updateCurrentPlanStatus,
    pvUpdatePollStop,
    addHookRequest,
    updateHookRequest,
    watchHookAddEditStatus,
    hookAddEditStatus,
    cancelAddEditWatch,
    resetAddEditState,
    removeHookRequest
  } = props;

  enum stepId {
    General = 1,
    MigrationSource,
    PersistentVolumes,
    StorageClass,
    MigrationTarget,
    Hooks,
    Results,
  }
  const handleClose = () => {
    onHandleWizardModalClose();
    setStepIdReached(stepId.General);
    pollingContext.startAllDefaultPolling();
    resetForm();
    resetCurrentPlan();
    stopPlanStatusPolling(props.values.planName);
    pvUpdatePollStop();
  };

  useEffect(() => {
    if (isOpen) {
      pollingContext.stopAllPolling();
    }
  }, [isOpen]);


  useEffect(
    () => {
      const steps = [
        {
          id: stepId.General,
          name: 'General',
          component: (
            <WizardStepContainer title="General">
              <GeneralForm
                values={values}
                errors={errors}
                touched={touched}
                handleBlur={handleBlur}
                handleChange={handleChange}
                setFieldTouched={setFieldTouched}
                isEdit={isEdit}
              />
            </WizardStepContainer>
          ),
          enableNext: !errors.planName && (touched.planName === true || isEdit === true),
        },
        {
          id: stepId.MigrationSource,
          name: 'Resources',
          component: (
            <WizardStepContainer title="Resources">
              <ResourceSelectForm
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                clusterList={clusterList}
                storageList={storageList}
                isFetchingNamespaceList={isFetchingNamespaceList}
                fetchNamespacesRequest={fetchNamespacesRequest}
                sourceClusterNamespaces={sourceClusterNamespaces}
                isEdit={isEdit}
              />
            </WizardStepContainer>
          ),
          enableNext:
            (!errors.selectedStorage &&
              touched.selectedStorage === true &&
              !errors.targetCluster &&
              touched.targetCluster === true &&
              !errors.sourceCluster &&
              touched.sourceCluster === true &&
              !errors.selectedNamespaces) ||
            (isEdit &&
              !errors.selectedStorage &&
              !errors.targetCluster &&
              !errors.sourceCluster &&
              !errors.selectedNamespaces),
          canJumpTo: stepIdReached >= stepId.MigrationSource,
        },
        {
          id: stepId.PersistentVolumes,
          name: 'Persistent volumes',
          component: (
            <WizardStepContainer title="Persistent volumes">
              <VolumesForm
                values={values}
                setFieldValue={setFieldValue}
                currentPlan={currentPlan}
                isPVError={isPVError}
                getPVResourcesRequest={getPVResourcesRequest}
                pvResourceList={pvResourceList}
                isFetchingPVResources={isFetchingPVList}
                isPollingStatus={isPollingStatus}
                planUpdateRequest={planUpdateRequest}
                currentPlanStatus={currentPlanStatus}
              />
            </WizardStepContainer>
          ),
          enableNext:
            !isFetchingPVList &&
            currentPlanStatus.state !== 'Pending' &&
            currentPlanStatus.state !== 'Critical',
          canJumpTo: stepIdReached >= stepId.PersistentVolumes,
        },
        {
          id: stepId.StorageClass,
          name: 'Copy options',
          component: (
            <WizardStepContainer title="Copy options">
              <CopyOptionsForm
                values={values}
                setFieldValue={setFieldValue}
                currentPlan={currentPlan}
                isFetchingPVList={isFetchingPVList}
                clusterList={clusterList}
              />
            </WizardStepContainer>
          ),
          canJumpTo: stepIdReached >= stepId.StorageClass,
        },
        {
          id: stepId.Hooks,
          name: 'Hooks',
          component: (
            <WizardStepContainer title="Hooks">
              <HooksStep
                removeHookRequest={removeHookRequest}
                addHookRequest={addHookRequest}
                updateHookRequest={updateHookRequest}
                isFetchingHookList={isFetchingHookList}
                migHookList={migHookList}
                fetchHooksRequest={fetchHooksRequest}
                watchHookAddEditStatus={watchHookAddEditStatus}
                hookAddEditStatus={hookAddEditStatus}
                cancelAddEditWatch={cancelAddEditWatch}
                resetAddEditState={resetAddEditState}
                currentPlan={currentPlan}
                isAddHooksOpen={isAddHooksOpen}
                setIsAddHooksOpen={setIsAddHooksOpen}
              />
            </WizardStepContainer>
          ),
          canJumpTo: stepIdReached >= stepId.Hooks,
          enableNext:
            !isAddHooksOpen,
          hideBackButton: isAddHooksOpen,
          hideCancelButton: isAddHooksOpen,
          nextButtonText: 'Finish'
        },
        {
          id: stepId.Results,
          name: 'Results',
          isFinishedStep: true,
          component: (
            <ResultsStep
              values={values}
              errors={errors}
              currentPlan={currentPlan}
              currentPlanStatus={currentPlanStatus}
              isPollingStatus={isPollingStatus}
              startPlanStatusPolling={startPlanStatusPolling}
              onClose={handleClose}
            />
          ),
        },
      ];

      setUpdatedSteps(steps);
    },
    //****************** Don't forget to update this array if you add changes to wizard children!!! */
    [
      currentPlan,
      values,
      isPVError,
      isFetchingPVList,
      isPollingStatus,
      isFetchingNamespaceList,
      pvResourceList,
      errors,
      touched,
      currentPlanStatus,
      migHookList,
      hookAddEditStatus,
      isAddHooksOpen,
      isFetchingHookList
    ]
  );

  const onMove = (curr, prev) => {
    //stop pv polling when navigating
    pvUpdatePollStop();
    //
    if (stepIdReached < curr.id) {
      setStepIdReached(curr.id);
    }

    if (curr.id === stepId.MigrationSource && isEdit) {
      setCurrentPlan(editPlanObj);
    }

    if (prev.prevId === stepId.MigrationSource && curr.id !== stepId.General) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs

      if (!currentPlan && !isEdit) {
        addPlanRequest({
          planName: props.values.planName,
          sourceCluster: props.values.sourceCluster,
          targetCluster: props.values.targetCluster,
          selectedStorage: props.values.selectedStorage,
          namespaces: props.values.selectedNamespaces,
        });
      }
    }
    if (curr.id === stepId.Results) {
      updateCurrentPlanStatus({ state: CurrentPlanState.Pending });
      //update plan & start status polling on results page
      planUpdateRequest(props.values, false);
    }
    if (prev.prevId === stepId.Hooks && curr.id === stepId.StorageClass) {
      setIsAddHooksOpen(false)
    }

  };
  return (
    <React.Fragment>
      {isOpen && (
        <Wizard
          isOpen={isOpen}
          onNext={onMove}
          onBack={onMove}
          title="Create a migration plan"
          onClose={handleClose}
          steps={updatedSteps}
          isFullWidth
          isCompactNav
          className={styles.wizardModifier}
          onSubmit={event => event.preventDefault()}
        />
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
