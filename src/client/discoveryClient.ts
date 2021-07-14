import { OAuthClient } from './resources/common';

import type { AxiosStatic, AxiosInstance, ResponseType } from 'axios';
import { IDiscoveryParameters, IDiscoveryResource } from './resources/discovery';

let axios: AxiosStatic;
try {
  axios = require('axios');
  // eslint-disable-next-line no-empty
} catch (e) {}

export interface IDiscoveryClient {
  // eslint-disable-next-line @typescript-eslint/ban-types
  get(resource: IDiscoveryResource, params?: object): Promise<any>;
  getRaw(path: string): Promise<any>;
  apiRoot(): string;
  rootNamespace(): string;
  setTokenExpiryHandler: (TokenExpiryHandler: any, number: any) => void;
}

export class DiscoveryClient extends OAuthClient implements IDiscoveryClient {
  private readonly _discoveryApi: string;
  private readonly _discoveryNamespace: string;
  private readonly _requester: AxiosInstance;

  constructor(
    discoveryApi: string,
    discoveryNamespace: string,
    token: string,
    customResponseType: ResponseType = 'json'
  ) {
    super(token);
    this._discoveryApi = discoveryApi;
    this._discoveryNamespace = discoveryNamespace;
    const headers = {
      ...super.getOAuthHeader(),
    };
    this._requester = axios.create({
      baseURL: this._discoveryApi,
      headers,
      responseType: customResponseType,
    });
  }

  public rootNamespace(): string {
    return ['namespaces', this._discoveryNamespace].join('/');
  }

  public apiRoot(): string {
    return [this._discoveryApi, this.rootNamespace()].join('/');
  }

  private fullPath(resourcePath: string): string {
    return [this.rootNamespace(), resourcePath].join('/');
  }

  public get = (resource: IDiscoveryResource, params?: IDiscoveryParameters): Promise<any> => {
    if (params && resource.parametrized) {
      return this._get(this.fullPath(resource.path()), resource?.parametrized(params));
    } else {
      return this._get(this.fullPath(resource.path()));
    }
  };

  public getRaw = (path: string): Promise<any> => {
    return this._get(path);
  };

  private _get = async (path: string, params?: any): Promise<any> => {
    try {
      return await this._requester.get(path, params);
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  };
}
