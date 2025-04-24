import { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { AssetDetails, AssetMetadata } from '@polkadot/types/interfaces/assets';
import type { Header } from '@polkadot/types/interfaces/runtime';
import type { EventRecord } from '@polkadot/types/interfaces/system';

import type { AssetInfo } from './types';

export interface BlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  parentHash: string;
  extrinsicsCount: number;
}

/**
 * Fetch all assets from the chain
 * @param api - The WarpX API instance
 * @returns An array of asset information
 */
export async function fetchAssets(api: ApiPromise): Promise<AssetInfo[]> {
  const assetEntries = await api.query.assets.asset.entries();

  const assets = await Promise.all(
    assetEntries.map(async ([key, assetOption]) => {
      const id = (key.args[0] as unknown as { toNumber: () => number }).toNumber();
      const asset = (assetOption as unknown as Option<AssetDetails>).unwrap();

      const metadata = await api.query.assets.metadata(id);
      const unwrappedMetadata = (metadata as unknown as Option<AssetMetadata>).unwrap();

      const assetInfo: AssetInfo = {
        id,
        owner: asset.owner.toString(),
        name: unwrappedMetadata.name.toString(),
        symbol: unwrappedMetadata.symbol.toString(),
        decimals: unwrappedMetadata.decimals.toNumber(),
        totalSupply: asset.supply.toString(),
        isFrozen: asset.isFrozen.isTrue,
        minBalance: asset.minBalance?.toString(),
      };

      return assetInfo;
    }),
  );

  return assets;
}

/**
 * Subscribe to asset transfer events
 * @param api - The WarpX API instance
 * @param callback - Callback function to handle transfer events
 * @returns Promise that resolves to an unsubscribe function
 */
export function subscribeToAssetTransfers(
  api: ApiPromise,
  callback: (from: string, to: string, amount: string) => void,
): Promise<() => void> {
  return api.query.system.events((events: EventRecord[]) => {
    events.forEach((record: EventRecord) => {
      const { event } = record;
      if (event.section === 'assets' && event.method === 'Transfer') {
        const [from, to, amount] = event.data;
        callback(from.toString(), to.toString(), amount.toString());
      }
    });
  }) as unknown as Promise<() => void>;
}

/**
 * Fetch recent blocks from the chain
 * @param api - The WarpX API instance
 * @param count - Number of recent blocks to fetch
 * @returns An array of block information
 */
export async function fetchRecentBlocks(
  api: ApiPromise,
  count: number = 10,
): Promise<BlockInfo[]> {
  const blocks: BlockInfo[] = [];
  const currentBlock = await api.rpc.chain.getHeader();
  let currentBlockNumber = currentBlock.number.toNumber();

  for (let i = 0; i < count && currentBlockNumber > 0; i++) {
    const blockHash = await api.rpc.chain.getBlockHash(currentBlockNumber);
    const blockHeader = await api.rpc.chain.getHeader(blockHash);
    const block = await api.rpc.chain.getBlock(blockHash);

    blocks.push({
      number: currentBlockNumber,
      hash: blockHash.toString(),
      timestamp: Date.now(),
      parentHash: blockHeader.parentHash.toString(),
      extrinsicsCount: block.block.extrinsics.length,
    });

    currentBlockNumber--;
  }

  return blocks;
}
