export function toChainAmount(amount: string, decimals: number): string {
  if (!amount) return '0';
  const [intPart, fracPart = ''] = amount.split('.');
  const paddedFrac = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  return (intPart + paddedFrac).replace(/^0+/, '') || '0';
}

export function toChainPrice(price: string, poolDecimals: number): string {
  // price도 마찬가지로 poolDecimals만큼 곱해서 정수로 변환
  return toChainAmount(price, poolDecimals);
}
