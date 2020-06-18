import { INameNamespaceRef } from '../../common/duck/types';

export interface IMigToken {
  apiVersion: string;
  kind: string;
  metadata: INameNamespaceRef;
  spec: {
    migClusterRef: INameNamespaceRef;
    migrationControllerRef?: INameNamespaceRef;
    secretRef: INameNamespaceRef;
  };
  status: {
    observedDigest: string;
    type: string;
    expiresAt: string;
  };
}

// NATODO: Define the token secret type
// probably needs some shared fields like kind and metadata
// export interface ITokenSecret {
//   data: {
//     token: string;
//   }
// }

export interface IToken {
  MigToken: IMigToken;
  // Secret: ITokenSecret;
  Secret: {
    data: {
      token: string;
    };
  };
}

export enum TokenFieldKey {
  Name = 'name',
  AssociatedClusterName = 'associatedClusterName',
  TokenType = 'tokenType',
  ServiceAccountToken = 'serviceAccountToken',
}

export enum TokenType {
  OAuth = 'oAuth',
  ServiceAccount = 'serviceAccount',
}

export interface ITokenFormValues {
  [TokenFieldKey.Name]: string;
  [TokenFieldKey.AssociatedClusterName]: string;
  [TokenFieldKey.TokenType]: TokenType;
  [TokenFieldKey.ServiceAccountToken]: string;
}
