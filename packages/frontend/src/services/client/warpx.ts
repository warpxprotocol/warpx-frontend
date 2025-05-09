import '@polkadex/sdk/interfaces/augment-api';
import { ApiPromise } from '@polkadot/api';

import { getPolkadotApi } from '@/services/config/polkadot';

const apiMap: Map<string, ApiPromise> = new Map();

export async function initWarpXApi(): Promise<ApiPromise> {
  if (!apiMap.has('warpx')) {
    const api = await getPolkadotApi('warpx');
    apiMap.set('warpx', api);
  }
  return apiMap.get('warpx')!;
}

export async function disconnectWarpXApi(): Promise<void> {
  const api = apiMap.get('warpx');
  if (api) {
    await api.disconnect();
    apiMap.delete('warpx');
  }
}
