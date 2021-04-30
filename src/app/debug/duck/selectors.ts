import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { createSelector } from 'reselect';
import { DebugStatusType, IDebugRefRes, IDerivedDebugStatusObject } from './types';

const debugTreeSelector = (state) => state.debug.tree;
const debugRefsSelector = (state) => state.debug.debugRefs;

const getDebugTreeWithStatus = createSelector(
  [debugTreeSelector, debugRefsSelector],
  (tree: any, refs: any) => {
    const addDebugStatusToRef = (refs, obj) => {
      const matchingDebugRef = refs?.find((ref) => ref?.value.data.name === obj?.name);
      const statusObject = {
        ...getResourceStatus(matchingDebugRef),
      };

      const newDebugRef = {
        ...matchingDebugRef?.value.data?.object,
        refName: matchingDebugRef?.value.data?.name,
        debugResourceStatus: statusObject,
        resourceKind: matchingDebugRef?.kind,
      };
      obj['debugRef'] = newDebugRef;
    };

    const sortMigrations = (refs, obj) => {
      if (obj['kind'] === 'Plan') {
        obj['children'] = obj['children'].sort((left, right) => {
          return dayjs
            .utc(right.debugRef.metadata.creationTimestamp)
            .diff(dayjs.utc(left.debugRef.metadata.creationTimestamp));
        });
      }
    };
    const clonedTree = cloneDeep(tree);

    const modifyTree = (obj, modification) => {
      for (const k in obj) {
        if (typeof obj[k] == 'object' && obj[k] !== null) {
          modifyTree(obj[k], modification);
        } else {
          modification(refs, obj);
        }
      }
    };

    modifyTree(clonedTree, addDebugStatusToRef);
    modifyTree(clonedTree, sortMigrations);

    return clonedTree;
  }
);

const getResourceStatus = (debugRef: IDebugRefRes): IDerivedDebugStatusObject => {
  const warningConditionTypes = ['Critical', 'Error', 'Warn'];
  const checkListContainsString = (val: string, stringList: Array<string>) => {
    if (stringList.indexOf(val) > -1) {
      return true;
    } else {
      return false;
    }
  };

  switch (debugRef?.kind) {
    case 'Job': {
      const { conditions, startTime, completionTime } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasRunning = startTime != undefined && completionTime == undefined;
      const hasTerminating = deletionTimestamp != undefined;
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) => c.type === 'Complete');
      const hasPending = startTime == undefined;
      return {
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          null,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
      };
    }
    case 'Pod': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasFailure = phase === 'Failed' || phase === 'Unknown';
      const hasCompleted = phase === 'Succeeded';
      const hasRunning = phase === 'Running';
      const hasTerminating = deletionTimestamp != undefined;
      const hasPending = phase === 'Pending';
      return {
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          null,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
      };
    }
    case 'PVC': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasFailure = phase === 'Lost';
      const hasPending = phase === 'Pending';
      const hasBound = phase === 'Bound';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasFailure,
        hasPending,
        hasBound,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          null,
          hasFailure,
          null,
          null,
          hasTerminating,
          hasPending,
          hasBound,
          null,
          null
        ),
      };
    }
    case 'PV': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasFailure = phase === 'Failed';
      const hasPending = phase === 'Pending';
      const hasBound = phase === 'Bound';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasFailure,
        hasPending,
        hasBound,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          null,
          hasFailure,
          null,
          null,
          hasTerminating,
          hasPending,
          hasBound,
          null,
          null
        ),
      };
    }
    case 'Route': {
      const { ingress } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;

      let admitted = '';
      ingress.forEach((ing) => ing.conditions.forEach((cond) => (admitted = cond.status)));

      const hasFailure = admitted === 'Unknown';
      const hasPending = admitted === 'False';
      const hasAdmitted = admitted === 'True';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasFailure,
        hasPending,
        hasAdmitted,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          null,
          hasFailure,
          null,
          null,
          hasTerminating,
          hasPending,
          null,
          hasAdmitted,
          null
        ),
      };
    }
    case 'Backup': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = warnings?.length > 0 || phase === 'PartiallyFailed';
      const hasFailure = errors?.length > 0 || phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'Restore': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = warnings?.length > 0 || phase === 'PartiallyFailed';
      const hasFailure = errors?.length > 0 || phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,

        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'PodVolumeBackup': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = phase === 'PartiallyFailed';
      const hasFailure = phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'PodVolumeRestore': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = phase === 'PartiallyFailed';
      const hasFailure = phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'DirectImageMigration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'DirectVolumeMigration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'DirectImageStreamMigration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'DirectVolumeMigrationProgress': {
      const {
        errors,
        warnings,
        phase,
        conditions,
        totalProgressPercentage,
      } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;

      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some(
        (c) =>
          checkListContainsString(c.type, ['InvalidPod', 'InvalidPodRef']) || phase === 'Failed'
      );
      const hasCompleted = phase === 'Succeeded';
      const hasRunning = totalProgressPercentage !== '100%';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'Migration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Succeeded', 'Completed'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'Plan': {
      const { conditions } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Succeeded', 'Completed'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
      };
    }
    case 'Hook': {
      const { conditions } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) => c.type === 'Critical');
      const hasReady = conditions?.some((c) => c.type === 'Ready');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasReady,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning,
          null,
          null,
          null,
          hasTerminating,
          null,
          null,
          null,
          hasReady
        ),
      };
    }
  }
};

const calculateCurrentStatus = (
  hasWarning?,
  hasFailure?,
  hasCompleted?,
  hasRunning?,
  hasTerminating?,
  hasPending?,
  hasBound?,
  hasAdmitted?,
  hasReady?
) => {
  let currentStatus;
  if (hasTerminating) {
    currentStatus = DebugStatusType.Terminating;
  } else if (hasRunning) {
    currentStatus = DebugStatusType.Running;
  } else if (hasFailure) {
    currentStatus = DebugStatusType.Failure;
  } else if (hasWarning) {
    currentStatus = DebugStatusType.Warning;
  } else if (hasPending) {
    currentStatus = DebugStatusType.Pending;
  } else if (hasBound) {
    currentStatus = DebugStatusType.Bound;
  } else if (hasAdmitted) {
    currentStatus = DebugStatusType.Admitted;
  } else if (hasReady) {
    currentStatus = DebugStatusType.Ready;
  } else if (hasCompleted) {
    currentStatus = DebugStatusType.Completed;
  }
  return currentStatus;
};

export default {
  getDebugTreeWithStatus,
};
