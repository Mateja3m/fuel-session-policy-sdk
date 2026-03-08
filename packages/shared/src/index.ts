export type SupportedNetwork = 'local' | 'testnet';

export interface NetworkConfig {
  network: SupportedNetwork;
  nodeUrl: string;
}

export const DEFAULT_LOCAL_NODE_URL = 'http://127.0.0.1:4000/graphql';
export const DEFAULT_TESTNET_NODE_URL = 'https://testnet.fuel.network/v1/graphql';
