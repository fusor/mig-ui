import { IDiscoveryClient } from '../discoveryClient';

export enum ClusterKind {
  source = 'source',
  destination = 'destination',
  controller = 'controller',
}

export interface IPodContainer {
  name: string;
  log: string;
}

export interface IPodLogSource {
  name: string;
  namespace: string;
  containers: IPodContainer[];
}

export type IPlanLogSources = {
  [key in ClusterKind]: IPodLogSource[];
};

export interface IPlanReport extends IPlanLogSources {
  namespace: string;
  name: string;
}
export interface IPodCollectorDiscoveryResource {
  discoveryAggregator(): string;
  discoveryType(): string;
  path(): string;
}

export interface IDebugTreeResource {
  discoveryAggregator(): string;
  discoveryType(): string;
  path(): string;
}
export interface IDiscoveryResource {
  discoveryAggregator(): string;
  discoveryType(): string;
  path(): string;
  parametrized?(params: IDiscoveryParameters): { [param: string]: string };
}
export interface IDiscoveryParameters {
  offset?: number;
  limit?: number;
  [param: string]: string | number;
}

export interface INamedDiscoveryResource extends IDiscoveryResource {
  discoveryName(): string;
}

export interface IDebugTreeResource {
  discoveryAggregator(): string;
  discoveryType(): string;
  path(): string;
}

export class DebugTreeDiscoveryResource implements IDebugTreeResource {
  private readonly _aggregatorType: string;
  private readonly _aggregatorName: string;
  private readonly _aggregatorSpecifier: string;

  constructor(planName: string, migrationName: string, treeType = 'plans') {
    this._aggregatorType = treeType;
    this._aggregatorName = planName;
    this._aggregatorSpecifier = migrationName;
  }

  public discoveryType() {
    return 'tree';
  }

  public discoveryAggregator() {
    return [this._aggregatorType, this._aggregatorName].join('/');
  }

  public path(): string {
    return [this.discoveryAggregator(), this.discoveryType(), this._aggregatorSpecifier].join('/');
  }
}

export class PodCollectorDiscoveryResource implements IPodCollectorDiscoveryResource {
  private readonly _clusterName: string;

  constructor(clusterName: string) {
    this._clusterName = clusterName;
  }
  public discoveryType() {
    return 'clusters';
  }

  public discoveryAggregator() {
    return 'namespaces/openshift-migration/pods';
  }

  public path(): string {
    return [this.discoveryType(), this._clusterName, this.discoveryAggregator()].join('/');
  }
}

export abstract class DiscoveryResource implements IDiscoveryResource {
  private readonly _type: string;
  private readonly _aggregatorType: string;
  private readonly _aggregatorName: string;
  private _discoveryParameters: IDiscoveryParameters;

  constructor(
    aggregatorName: string,
    type: string,
    discoveryParameters: IDiscoveryParameters,
    customAggregatorType = 'clusters'
  ) {
    this._aggregatorType = customAggregatorType;
    this._aggregatorName = aggregatorName;
    this._type = type;
    this._discoveryParameters = discoveryParameters;
  }

  public discoveryType() {
    return this._type;
  }

  public discoveryAggregator() {
    return [this._aggregatorType, this._aggregatorName].join('/');
  }

  public parametrized(params: IDiscoveryParameters = {}) {
    const merged = {} as any;
    Object.keys(this._discoveryParameters).map(
      (param) => (merged[param] = this._discoveryParameters[param].toString())
    );
    Object.keys(params).map(
      (param) => (merged[param] = this._discoveryParameters[param].toString())
    );
    return merged;
  }

  public path(): string {
    return [this.discoveryAggregator(), this.discoveryType()].join('/');
  }
}

export abstract class NamedDiscoveryResource
  extends DiscoveryResource
  implements INamedDiscoveryResource
{
  private readonly _name: string;

  constructor(
    name: string,
    aggregator: string,
    type: string,
    discoveryParameters: IDiscoveryParameters,
    customAggregatorType = 'clusters'
  ) {
    super(aggregator, type, discoveryParameters, customAggregatorType);

    this._name = name;
  }

  public discoveryName() {
    return this._name;
  }

  public path(): string {
    return [super.path(), this.discoveryName()].join('/');
  }
}

export class NamespaceDiscovery extends DiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'namespaces', params);
  }

  public async get(client: IDiscoveryClient): Promise<string[]> {
    const ns = await client.get(this);
    return ns.data;
  }
}

export class PersistentVolumesDiscovery extends DiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'persistentvolumes', params);
  }

  public async get(client: IDiscoveryClient): Promise<any> {
    const pv = await client.get(this);
    return pv.data;
  }
}

export class PersistentVolumeDiscovery extends NamedDiscoveryResource {
  constructor(name: string, cluster: string, params: IDiscoveryParameters = {}) {
    super(name, cluster, 'persistentvolumes', params);
  }

  public async get(client: IDiscoveryClient): Promise<any[]> {
    const pvs = await client.get(this);
    return pvs.data;
  }
}

export class PlanPodReportDiscovery extends DiscoveryResource {
  constructor(planName: string, params: IDiscoveryParameters = {}) {
    super(planName, 'pods', params, 'plans');
  }

  public async get(client: IDiscoveryClient): Promise<IPlanReport> {
    const report = await client.get(this);
    return report.data;
  }
}
