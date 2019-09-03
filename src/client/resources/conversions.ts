import { pvStorageClassAssignmentKey } from '../../app/plan/components/Wizard/StorageClassTable';

export function createTokenSecret(name: string, namespace: string, rawToken: string) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    apiVersion: 'v1',
    data: {
      saToken: encodedToken,
    },
    kind: 'Secret',
    metadata: {
      name,
      namespace,
    },
    type: 'Opaque',
  };
}

export function updateTokenSecret(rawToken: string) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    data: {
      saToken: encodedToken,
    },
  };
}

export function tokenFromSecret(secret: any) {
  return atob(secret.data.token);
}

export function createClusterRegistryObj(name: string, namespace: string, serverAddress: string) {
  return {
    apiVersion: 'clusterregistry.k8s.io/v1alpha1',
    kind: 'Cluster',
    metadata: {
      name,
      namespace,
    },
    spec: {
      kubernetesApiEndpoints: {
        serverEndpoints: [
          {
            clientCIDR: '0.0.0.0',
            serverAddress,
          },
        ],
      },
    },
  };
}

export function updateClusterRegistryObj(serverAddress: string) {
  return {
    spec: {
      kubernetesApiEndpoints: {
        serverEndpoints: [
          {
            clientCIDR: '0.0.0.0',
            serverAddress,
          },
        ],
      },
    },
  };
}

export function createMigCluster(
  name: string,
  namespace: string,
  clusterRegistryObj: any,
  tokenSecret: any
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigCluster',
    metadata: {
      name,
      namespace,
    },
    spec: {
      isHostCluster: false,
      clusterRef: {
        name: clusterRegistryObj.metadata.name,
        namespace: clusterRegistryObj.metadata.namespace,
      },
      serviceAccountSecretRef: {
        name: tokenSecret.metadata.name,
        namespace: tokenSecret.metadata.namespace,
      },
    },
  };
}

export function createMigStorage(
  name: string,
  bucketName: string,
  bucketRegion: string,
  s3Url: string,
  namespace: string,
  tokenSecret: any
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigStorage',
    metadata: {
      name,
      namespace,
    },
    spec: {
      backupStorageProvider: 'aws',
      volumeSnapshotProvider: 'aws',
      backupStorageConfig: {
        awsBucketName: bucketName,
        awsRegion: bucketRegion,
        awsS3Url: s3Url,
        credsSecretRef: {
          name: tokenSecret.metadata.name,
          namespace: tokenSecret.metadata.namespace,
        },
      },
      volumeSnapshotConfig: {
        awsRegion: bucketRegion,
        credsSecretRef: {
          name: tokenSecret.metadata.name,
          namespace: tokenSecret.metadata.namespace,
        },
      },
    },
  };
}

export function updateMigStorage(
  bucketName: string,
  bucketRegion: string,
  s3Url: string,
) {
  return {
    spec: {
      backupStorageConfig: {
        awsBucketName: bucketName,
        awsRegion: bucketRegion,
        awsS3Url: s3Url,
      },
      volumeSnapshotConfig: {
        awsRegion: bucketRegion,
      },
    },
  };
}

export function createStorageSecret(
  name: string,
  namespace: string,
  secretKey: any,
  accessKey: string
) {
  // btoa => to base64, atob => from base64
  const encodedAccessKey = btoa(accessKey);
  const encodedSecretKey = btoa(secretKey);
  return {
    apiVersion: 'v1',
    data: {
      'aws-access-key-id': encodedAccessKey,
      'aws-secret-access-key': encodedSecretKey,
    },
    kind: 'Secret',
    metadata: {
      name,
      namespace,
    },
    type: 'Opaque',
  };
}

export function updateStorageSecret(secretKey: any, accessKey: string) {
  // btoa => to base64, atob => from base64
  const encodedAccessKey = btoa(accessKey);
  const encodedSecretKey = btoa(secretKey);
  return {
    data: {
      'aws-access-key-id': encodedAccessKey,
      'aws-secret-access-key': encodedSecretKey,
    },
  };
}

export function createMigPlan(
  name: string,
  namespace: string,
  sourceClusterObj: any,
  destinationClusterObj: any,
  storageObj: any
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: {
      name,
      namespace,
    },
    spec: {
      srcMigClusterRef: {
        name: sourceClusterObj,
        namespace,
      },
      destMigClusterRef: {
        name: destinationClusterObj,
        namespace,
      },
      migStorageRef: {
        name: storageObj,
        namespace,
      },
    },
  };
}

export function updateMigPlanFromValues(migPlan: any, planValues: any) {
  const updatedSpec = Object.assign({}, migPlan.spec);
  if (planValues.selectedStorage) {
    updatedSpec.migStorageRef = {
      name: planValues.selectedStorage,
      namespace: migPlan.metadata.namespace,
    };
  }

  if (updatedSpec.persistentVolumes) {
    updatedSpec.persistentVolumes = updatedSpec.persistentVolumes.map(v => {
      const userPv = planValues.persistentVolumes.find(upv => upv.name === v.name);
      if (userPv) {
        v.selection.action = userPv.type;
        if (userPv.type === "copy") {
          v.selection.storageClass = planValues[pvStorageClassAssignmentKey][v.name].name;
        }
      }
      return v;
    });
  }
  if (planValues.planClosed) {
    updatedSpec.closed = true;
  }

  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: migPlan.metadata,
    spec: updatedSpec,
  };
}

export function createInitialMigPlan(
  name: string,
  namespace: string,
  sourceClusterObj: any,
  destinationClusterObj: any,
  storageObj: any,
  namespaces: string[]
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: {
      name,
      namespace,
    },
    spec: {
      srcMigClusterRef: {
        name: sourceClusterObj,
        namespace,
      },
      destMigClusterRef: {
        name: destinationClusterObj,
        namespace,
      },
      migStorageRef: {
        name: storageObj,
        namespace,
      },
      namespaces,
    },
  };
}

export function createMigMigration(
  migID: string,
  planName: string,
  namespace: string,
  isStage: boolean,
  disableQuiesce: boolean
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigMigration',
    metadata: {
      name: migID,
      namespace,
    },
    spec: {
      migPlanRef: {
        name: planName,
        namespace,
      },
      quiescePods: !isStage && !disableQuiesce,
      stage: isStage,
    },
  };
}

export type IMigPlan = ReturnType<typeof createMigPlan>;
export type IMigCluster = ReturnType<typeof createMigCluster>;
export type IMigMigration = ReturnType<typeof createMigMigration>;
export type IClusterRegistryObj = ReturnType<typeof createClusterRegistryObj>;
export type IMigStorage = ReturnType<typeof createMigStorage>;
export type IStorageSecret = ReturnType<typeof createStorageSecret>;
