import React from 'react';

interface MarketOrderSummaryProps {
  orderType: string; // 예: 'Market Buy BTC'
  amount: number; // 사람이 읽는 단위
  baseToken: string;
  orderValue: number; // 사람이 읽는 단위
  quoteToken: string;
  marketPrice: number;
  lotSize: number;
  decimals: number;
  slippage?: number; // %
  fee?: number; // %
}

function formatLotSize(lotSize: number, decimals: number) {
  const displayValue = lotSize / 10 ** decimals;
  return displayValue < 1e-6
    ? displayValue.toExponential()
    : displayValue.toLocaleString(undefined, {
        maximumFractionDigits: 12,
        minimumFractionDigits: displayValue < 1 ? 2 : 0,
      });
}

export default function MarketOrderSummary({
  orderType,
  amount,
  baseToken,
  quoteToken,
  marketPrice,
  lotSize,
  decimals,
  slippage,
  fee,
}: MarketOrderSummaryProps) {
  const priceDecimals = 2; // 실제 가격 소수점 자리수(예: 2, 4, 6 등)
  const realMarketPrice = marketPrice; // 이미 사람이 읽는 단위로 전달됨

  const isBuy = orderType.toLowerCase().includes('buy');
  // For Market Buy: amount is in quote token (USDT), qty is calculated
  // For Market Sell: amount is in base token (DOT), orderValue is calculated
  const qty = isBuy ? Number(amount) / realMarketPrice : Number(amount);
  const orderValue = isBuy ? Number(amount) : Number(amount) * realMarketPrice;

  console.debug('orderType:', orderType);
  console.debug('amount input:', amount);
  console.debug('marketPrice:', marketPrice);
  console.debug('realMarketPrice:', realMarketPrice);
  console.debug('Qty (base):', qty);
  console.debug('Order Value (quote):', orderValue);

  return (
    <div className="bg-[#23232A] p-4 rounded-lg shadow flex flex-col gap-2 text-sm">
      <div className="font-medium text-white">{orderType}</div>

      <div className="text-xs text-gray-400">Order Price</div>
      <div className="text-white">Market Price</div>

      <div className="text-xs text-gray-400">Qty</div>
      <div className="text-white font-medium">
        ≈ {qty.toFixed(decimals)} {baseToken}
      </div>

      <div className="text-xs text-gray-400">Order Value</div>
      <div className="text-white font-medium">
        {orderValue.toLocaleString(undefined, {
          maximumFractionDigits: decimals,
        })}{' '}
        {baseToken}
      </div>

      <div className="text-xs text-gray-400 mt-2">
        Minimum unit: {formatLotSize(lotSize, decimals)} {baseToken}
      </div>
      {slippage !== undefined && (
        <div className="text-xs text-gray-400">Slippage ±{slippage}%</div>
      )}
      {fee !== undefined && (
        <div className="text-xs text-gray-400">Trading Fee: {fee}%</div>
      )}
    </div>
  );
}
