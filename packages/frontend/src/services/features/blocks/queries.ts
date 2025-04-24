import { ApiPromise } from '@polkadot/api';
import type { Header } from '@polkadot/types/interfaces/runtime';

export const fetchLatestBlock = async (api: ApiPromise) => {
  const header = await api.rpc.chain.getHeader();
  return header;
};

export const subscribeToNewBlocks = (
  api: ApiPromise,
  callback: (header: Header) => void,
) => {
  return api.rpc.chain.subscribeNewHeads((header) => {
    callback(header);
  });
};
