import { ApiPromise, WsProvider } from '@polkadot/api';

export type NetworkType = 'warpx';
export type EndpointType = 'ws';

type NetworkEndpoints = Record<NetworkType, Partial<Record<EndpointType, string>>>;

const NETWORK_ENDPOINTS: NetworkEndpoints = {
  warpx: {
    ws: process.env.NEXT_PUBLIC_POLKADOT_WARPX_WS || 'ws://127.0.0.1:9988',
  },
};

const DEFAULT_NETWORK: NetworkType =
  (process.env.NEXT_PUBLIC_POLKADOT_NETWORK as NetworkType) || 'warpx';

const apiInstances: Partial<Record<NetworkType, ApiPromise>> = {};

/**
 * Utility to get a specific endpoint type for a network.
 */
function getEndpoint(network: NetworkType, type: EndpointType): string {
  const endpoint = NETWORK_ENDPOINTS[network]?.[type];
  if (!endpoint) {
    throw new Error(`❌ No ${type.toUpperCase()} endpoint configured for ${network}`);
  }
  return endpoint;
}

/**
 * Returns the Polkadot API instance for the specified network.
 */
export async function getPolkadotApi(
  network: NetworkType = DEFAULT_NETWORK,
): Promise<ApiPromise> {
  if (!apiInstances[network]) {
    const endpoint = getEndpoint(network, 'ws');

    if (!endpoint) {
      throw new Error(`❌ No WebSocket endpoint configured for ${network}`);
    }

    try {
      const provider = new WsProvider(endpoint);
      const api = await ApiPromise.create({ provider });
      apiInstances[network] = api;

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[WarpX] Connected to ${network} (${endpoint})`);
      }
    } catch (error) {
      throw new Error(
        `❌ Failed to connect to ${network} (${endpoint}): ${(error as Error).message}`,
      );
    }
  }

  return apiInstances[network]!;
}

/**
 * Disconnects from the API. Can disconnect from a specific network or all networks.
 */
export async function disconnectApi(network?: NetworkType): Promise<void> {
  const targets = network ? [network] : (Object.keys(apiInstances) as NetworkType[]);

  await Promise.all(
    targets.map(async (net) => {
      const instance = apiInstances[net];
      if (instance) {
        await instance.disconnect();
        delete apiInstances[net];

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[WarpX] Disconnected from ${net}`);
        }
      }
    }),
  );
}

/**
 * Returns the WarpX-specific Polkadot API instance.
 */
export async function getWarpXApi(): Promise<ApiPromise> {
  return getPolkadotApi('warpx');
}
