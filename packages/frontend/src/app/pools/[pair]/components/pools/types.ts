export interface Pool {
  id: string;
  name: string;
  protocol: string;
  feeTier: string;
  tvl: string;
  apr: string;
  token0: TokenInfo;
  token1: TokenInfo;
  priceRatio?: number;
}

export interface TokenInfo {
  id: number;
  symbol: string;
  iconUrl: string;
  usdPrice: number;
  priceRatio?: number;
}
