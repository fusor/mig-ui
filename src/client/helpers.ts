import { NamespacedResource, IGroupVersionKindPlural } from '@konveyor/lib-ui';

export class MigResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: MigResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'migration.openshift.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}

export enum MigResourceKind {
  MigPlan = 'migplans',
  MigStorage = 'migstorages',
  MigAssetCollection = 'migassetcollections',
  MigStage = 'migstages',
  MigMigration = 'migmigrations',
  MigCluster = 'migclusters',
  MigHook = 'mighooks',
  MigToken = 'migtokens',
  MigAnalytic = 'miganalytics',
}
