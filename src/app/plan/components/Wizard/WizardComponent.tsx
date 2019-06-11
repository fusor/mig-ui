import React from 'react';
import { Wizard } from '@patternfly/react-core';
import GeneralForm from './GeneralForm';
import MigSourceForm from './MigSourceForm';
import MigTargetForm from './MigTargetForm';
import VolumesForm from './VolumesForm';
import ResultsStep from './ResultsStep';
import { useToggleLoading } from '../../duck/hooks';

const WizardComponent = props => {
  const MigSourceStepId = 2;
  const HostClusterName = 'host';
  const [isLoading, toggleLoading] = useToggleLoading(false);
  const {
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    handleBlur,
    setFieldTouched,
    setFieldValue,
    clusterList,
    storageList,
  } = props;
  const steps = [
    {
      id: 1,
      name: 'General',
      component: (
        <GeneralForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldTouched={setFieldTouched}
        />
      ),
      enableNext: !errors.planName && touched.planName === true,
    },
    {
      id: 2,
      name: 'Migration Source',
      component: (
        <MigSourceForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          clusterList={clusterList}
          onWizardLoadingToggle={toggleLoading}
        />
      ),
      enableNext: !errors.sourceCluster && touched.sourceCluster === true && !isLoading,
    },
    {
      id: 3,
      name: 'Persistent Volumes',
      component: (
        <VolumesForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          onWizardLoadingToggle={toggleLoading}
        />
      ),
      enableNext: !errors.sourceCluster && touched.sourceCluster === true && !isLoading,
    },
    {
      id: 4,
      name: 'Migration Targets',
      component: (
        <MigTargetForm
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          clusterList={clusterList}
          storageList={storageList}
          onWizardLoadingToggle={toggleLoading}
        />
      ),
      enableNext: !errors.targetCluster && touched.targetCluster === true && !isLoading,
    },
    {
      id: 5,
      name: 'Results',
      component: (
        <ResultsStep
          values={values}
          errors={errors}
          onWizardLoadingToggle={toggleLoading}
          setFieldValue={setFieldValue}
        />
      ),
      enableNext: !isLoading,
      nextButtonText: 'Close',
      hideCancelButton: true,
      hideBackButton: true,
    },
  ];

  const onMove = (curr, prev) => {
    if (prev.prevId === MigSourceStepId) {
      // We must create the plan here so that the controller can evaluate the
      // requested namespaces and discover related PVs
      props.addPlan({
        planName: props.values.planName,
        sourceCluster: props.values.sourceCluster,
        targetCluster: HostClusterName,
        namespaces: props.values.selectedNamespaces.map(ns => ns.metadata.name),
      });
    }
    if (curr.id === 5) {
      props.handleSubmit();
    }
  };
  const handleClose = () => {
    props.onHandleClose();
    props.resetForm();
  };
  return (
    <React.Fragment>
      {props.isOpen && (
        <Wizard
          isOpen={props.isOpen}
          onNext={onMove}
          onBack={onMove}
          title="Migration Plan Wizard"
          description="Create a migration plan"
          onClose={() => {
            handleClose();
          }}
          steps={steps}
          isFullWidth
          isCompactNav
        />
      )}
    </React.Fragment>
  );
};

export default WizardComponent;
