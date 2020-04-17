import React, { useEffect } from 'react';
import { FormikProps } from 'formik';
import { isEmpty } from 'lodash';
import { IFormValues, IOtherProps } from './WizardContainer';
import CopyOptionsTable from './CopyOptionsTable';
import { IPlanPersistentVolume } from './types';

export const pvStorageClassAssignmentKey = 'pvStorageClassAssignment';
export const pvCopyMethodAssignmentKey = 'pvCopyMethodAssignment';
export const pvVerifyFlagAssignmentKey = 'pvVerifyFlagAssignment';

interface ICopyOptionsFormProps
  extends Pick<IOtherProps, 'clusterList' | 'currentPlan' | 'isFetchingPVList'>,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const CopyOptionsForm: React.FunctionComponent<ICopyOptionsFormProps> = ({
  clusterList,
  currentPlan,
  isFetchingPVList,
  setFieldValue,
  values,
}: ICopyOptionsFormProps) => {
  const migPlanPvs = currentPlan.spec.persistentVolumes;

  const destCluster = clusterList.find(
    c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
  );

  const storageClasses = (destCluster && destCluster.MigCluster.spec.storageClasses) || [];

  useEffect(() => {
    // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
    if (!values.pvStorageClassAssignment || isEmpty(values.pvStorageClassAssignment)) {
      let pvStorageClassAssignment = {};
      if (migPlanPvs) {
        pvStorageClassAssignment = migPlanPvs.reduce((assignedScs, pv) => {
          const suggestedStorageClass = storageClasses.find(
            sc => sc.name === pv.selection.storageClass
          );
          return {
            ...assignedScs,
            [pv.name]: suggestedStorageClass ? suggestedStorageClass : '',
          };
        }, {});
      }
      setFieldValue(pvStorageClassAssignmentKey, pvStorageClassAssignment);
    }
    if (!values.pvCopyMethodAssignment || isEmpty(values.pvCopyMethodAssignment)) {
      let pvCopyMethodAssignment = {};
      if (migPlanPvs) {
        pvCopyMethodAssignment = migPlanPvs.reduce((assignedCms, pv) => {
          const supportedCopyMethods = pv.supported.copyMethods || [];
          const suggestedCopyMethod = supportedCopyMethods.find(
            cm => cm === pv.selection.copyMethod
          );
          return {
            ...assignedCms,
            [pv.name]: suggestedCopyMethod ? suggestedCopyMethod : supportedCopyMethods[0],
          };
        }, {});
      }
      setFieldValue(pvCopyMethodAssignmentKey, pvCopyMethodAssignment);
    }
    if (!values.pvVerifyFlagAssignment || isEmpty(values.pvVerifyFlagAssignment)) {
      let pvVerifyFlagAssignment = {};
      if (migPlanPvs) {
        pvVerifyFlagAssignment = migPlanPvs.reduce(
          (assignedVerifyFlags, pv) => ({
            ...assignedVerifyFlags,
            [pv.name]: !!pv.selection.verify,
          }),
          {}
        );
      }
      setFieldValue(pvVerifyFlagAssignmentKey, pvVerifyFlagAssignment);
    }
  }, []);

  const onStorageClassChange = (currentPV: IPlanPersistentVolume, value: string) => {
    const newSc = storageClasses.find(sc => sc.name === value) || '';
    const updatedAssignment = {
      ...values.pvStorageClassAssignment,
      [currentPV.name]: newSc,
    };
    setFieldValue(pvStorageClassAssignmentKey, updatedAssignment);
  };

  const onVerifyFlagChange = (currentPV: IPlanPersistentVolume, value: boolean) => {
    const updatedAssignment = {
      ...values.pvVerifyFlagAssignment,
      [currentPV.name]: value,
    };
    setFieldValue(pvVerifyFlagAssignmentKey, updatedAssignment);
  };

  const onCopyMethodChange = (currentPV: IPlanPersistentVolume, value: string) => {
    const newCm = currentPV.supported.copyMethods.find(cm => cm === value);
    const updatedAssignment = {
      ...values.pvCopyMethodAssignment,
      [currentPV.name]: newCm,
    };
    setFieldValue(pvCopyMethodAssignmentKey, updatedAssignment);
  };

  return (
    <CopyOptionsTable
      isFetchingPVList={isFetchingPVList}
      currentPlan={currentPlan}
      persistentVolumes={
        values.persistentVolumes.length
          ? values.persistentVolumes.filter(v => v.type === 'copy')
          : []
      }
      pvStorageClassAssignment={values.pvStorageClassAssignment}
      pvVerifyFlagAssignment={values.pvVerifyFlagAssignment}
      pvCopyMethodAssignment={values.pvCopyMethodAssignment}
      storageClasses={storageClasses}
      onStorageClassChange={onStorageClassChange}
      onVerifyFlagChange={onVerifyFlagChange}
      onCopyMethodChange={onCopyMethodChange}
    />
  );
};
export default CopyOptionsForm;
