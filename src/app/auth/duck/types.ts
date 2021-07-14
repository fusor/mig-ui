export interface ILoginParams {
  token?: string;
  username?: string;
  access_token: string;
  expires_in?: number;
  expiry_time: number;
  login_time?: number;
  scope?: string;
  token_type?: string;
}

export interface IMigMeta {
  clusterApi?: string;
  discoveryApi?: string;
  proxyString?: string;
  namespace?: string;
  configNamespace?: string;
  hookRunnerImage?: string;
  oauth?: {
    clientId?: string;
    redirectUrl?: string;
    userScope?: string;
    clientSecret?: string;
  };
}
