import { ClusterClient } from '@konveyor/lib-ui';
import { AxiosError } from 'axios';
export interface IMetaTypeMeta {
  apiVersion: string;
  kind: string;
}
export interface IObjectReference {
  name: string;
  namespace: string;
  apiVersion?: string;
  fieldPath?: string;
  kind?: string;
  resourceVersion?: string;
  uid?: string;
}

export interface IMetaObjectMeta {
  name: string;
  namespace: string;
  selfLink?: string;
  uid?: string;
  resourceVersion?: string;
  generation?: number;
  creationTimestamp?: string; // ISO timestamp
  annotations?: Record<string, string | undefined>;
  labels?: {
    createdForResourceType?: string;
    createdForResource?: string;
  };
  managedFields?: unknown[];
  ownerReferences?: IObjectReference[];
}

export type KubeClientError = AxiosError<{ message: string }>;

export interface IKubeList<T> extends IMetaTypeMeta {
  items: T[];
  metadata: {
    continue: string;
    resourceVersion: string;
    selfLink: string;
  };
}

export type AuthorizedClusterClient = Pick<
  ClusterClient,
  'get' | 'list' | 'create' | 'delete' | 'patch' | 'put'
>;

export interface IKubeResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  config: Record<string, unknown>;
  headers: Record<string, unknown>;
  request: XMLHttpRequest;
  state?: string;
  reason?: string;
}

export interface IKubeStatus extends IMetaTypeMeta {
  status: string;
  details: {
    group: string;
    kind: string;
    name: string;
    uid: string;
  };
  metadata: Partial<IMetaObjectMeta>;
}
