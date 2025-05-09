export interface AssetInfo {
  id: number;
  owner: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  isFrozen: boolean;
  minBalance?: string;
  status?: string;
}

export interface BlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  parentHash: string;
  extrinsicsCount: number;
}
