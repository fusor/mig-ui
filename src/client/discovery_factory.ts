import { DiscoveryClient } from './discoveryClient';
import { ResponseType } from 'axios';
import { TokenExpiryHandler } from './resources/common';
import { ClientFactoryMissingUserError } from '@konveyor/lib-ui';

export class ClientFactoryMissingDiscoveryApi extends Error {
  constructor() {
    super('Discovery API URL missing from client factory');
    Object.setPrototypeOf(this, ClientFactoryMissingDiscoveryApi.prototype);
  }
}

interface IUser {
  access_token: string;
  expiry_time: number;
}

let tokenExpiryHandler: TokenExpiryHandler | null = null;
export const DiscoveryFactory = {
  discovery: (
    user: IUser,
    namespace: string,
    discoveryApi: string,
    clusterName?: string,
    tokenSecret?: string,
    customResponseType: ResponseType = 'json'
  ): DiscoveryClient | null => {
    if (!user) {
      throw new ClientFactoryMissingUserError();
    }

    let decodedToken: string | null = null;
    if (clusterName && tokenSecret) {
      decodedToken = atob(tokenSecret);
    }

    const discoveryClient = new DiscoveryClient(
      discoveryApi,
      namespace,
      decodedToken ? decodedToken : user.access_token,
      customResponseType
    );

    if (tokenExpiryHandler) {
      discoveryClient.setTokenExpiryHandler(
        tokenExpiryHandler as unknown as TokenExpiryHandler,
        user.expiry_time
      );
    }
    return discoveryClient;
  },
};

export const setTokenExpiryHandler = (newExpiryHandler: TokenExpiryHandler): void => {
  tokenExpiryHandler = newExpiryHandler;
};
