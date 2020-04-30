interface IMigClusterMetadata {
  creationTimestamp: any;
  generation: number;
  labels: {
    'controller-ToolsIcon.k8s.io': number;
    'migrations.openshift.io/migration-group': string;
  };
  name: string;
  namespaces: any[];
  resourceVersion: string;
  selfLink: string;
  uid: string;
}
interface IMigClusterSpec {
  clusterAuthSecretRef: {
    name: string;
    namespace: string;
  };
  clusterUrl: string;
}
export interface IMigCluster {
  apiVersion: string;
  kind: string;
  metadata: IMigClusterMetadata;
  spec: IMigClusterSpec;
  id: string;
}
export interface IClusterFormObject {
  url: string;
  token: string;
}

interface IMigStorageMetadata {
  creationTimestamp: any;
  generation: number;
  labels: {
    'controller-ToolsIcon.k8s.io': number;
    'migrations.openshift.io/migration-group': string;
  };
  name: string;
  namespace: string;
  resourceVersion: string;
  selfLink: string;
  uid: string;
  annotations: {
    'migration.openshift.io/mig-ui.aws-s3': 'true' | 'false';
  };
}
interface IMigStorageSpec {
  bucketUrl: string;
  backupStorageConfig: {
    awsBucketName: string;
    awsRegion: string;
    awsS3Url: string;
    gcpBucket: string;
    azureResourceGroup: string;
    azureStorageAccount: string;
    insecure: boolean;
    s3CustomCABundle: string;
  };
  backupStorageProvider: string;
  backupStorageLocationRef: {
    name: string;
  };
  migrationStorageSecretRef: {
    name: string;
    namespace: string;
  };
}
export interface IMigStorage {
  apiVersion: string;
  kind: string;
  metadata: IMigStorageMetadata;
  spec: IMigStorageSpec;
  id: string;
  status: string;
}

export interface IStorage {
  MigStorage: IMigStorage;
  Secret: {
    data: {
      'aws-access-key-id': string;
      'aws-secret-access-key': string;
      'gcp-credentials': string;
      'azure-credentials': string;
    };
  };
}
export interface IStorageFormObject {
  url: string;
  token: string;
}
