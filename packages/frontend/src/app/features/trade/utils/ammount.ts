export function toChainAmount(amount: string, decimals: number): string {
  if (!amount) return '0';
  return Math.floor(Number(amount) * 10 ** decimals).toString();
}

export function toChainPrice(price: string, poolDecimals: number): string {
  return toChainAmount(price, poolDecimals);
}
