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
  orderValue,
  quoteToken,
  marketPrice,
  lotSize,
  decimals,
  slippage,
  fee,
}: MarketOrderSummaryProps) {
  return (
    <div className="bg-[#23232A] p-4 rounded-lg shadow flex flex-col gap-2 text-sm">
      <div className="font-medium text-white">{orderType}</div>

      <div className="text-xs text-gray-400">Order Price</div>
      <div className="text-white">Market Price</div>

      <div className="text-xs text-gray-400">Qty</div>
      <div className="text-white">
        ≈{amount.toFixed(6)} {baseToken}
      </div>

      <div className="text-xs text-gray-400">Order Value</div>
      <div className="text-white">
        {orderValue.toFixed(2)} {quoteToken}
      </div>
      <div className="text-xs text-gray-500">
        ≈{orderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
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
