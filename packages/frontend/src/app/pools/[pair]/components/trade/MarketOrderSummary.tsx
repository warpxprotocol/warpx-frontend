import React from 'react';

interface OrderSummaryProps {
  orderType: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: number;
  baseToken: string;
  quoteToken: string;
  price: number; // limit price or market price
  lotSize: number;
  decimals: number;
  slippage?: number;
  fee?: number;
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

export default function OrderSummary({
  orderType,
  side,
  amount,
  baseToken,
  quoteToken,
  price,
  lotSize,
  decimals,
  slippage,
  fee,
}: OrderSummaryProps) {
  // 계산
  const isBuy = side === 'buy';
  const qty = amount;
  const orderValue = Number(amount) * Number(price);

  return (
    <div className="bg-[#23232A] p-4 rounded-lg shadow flex flex-col gap-2 text-sm">
      <div className="font-medium text-white">
        {orderType === 'market'
          ? `Market ${isBuy ? 'Buy' : 'Sell'}`
          : `Limit ${isBuy ? 'Buy' : 'Sell'}`}
      </div>

      <div className="text-xs text-gray-400">Order Price</div>
      <div className="text-white">
        {orderType === 'market' ? 'Market Price' : `${price} ${quoteToken}`}
      </div>

      <div className="text-xs text-gray-400">Qty</div>
      <div className="text-white font-medium">
        {qty} {baseToken}
      </div>

      <div className="text-xs text-gray-400">Order Value</div>
      <div className="text-white font-medium">
        {orderValue.toLocaleString(undefined, {
          maximumFractionDigits: decimals,
        })}{' '}
        {quoteToken}
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
