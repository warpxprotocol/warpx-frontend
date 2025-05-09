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
  const isBuy = side === 'buy';
  const qty = amount;
  const orderValue = Number(amount) * Number(price);

  return (
    <div className=" py-3 shadow-2xl w-full">
      {/* <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-white font-bold text-sm">
            {orderType === 'market'
              ? `Market ${side === 'buy' ? 'Buy' : 'Sell'}`
              : `Limit ${side === 'buy' ? 'Buy' : 'Sell'}`}
          </span>
          <span className="text-white font-bold text-lg ml-1">{baseToken}</span>
        </div>
      </div> */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Order Price</span>
        <span className="text-white font-medium">
          {orderType === 'market'
            ? `~${price.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${quoteToken}`
            : `${price.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${quoteToken}`}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Quantity</span>
        <span className="text-white font-medium">
          {qty.toLocaleString(undefined, { maximumFractionDigits: decimals })} {baseToken}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Order Value</span>
        <span className="text-white font-medium">
          {orderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {quoteToken}
        </span>
      </div>
      {slippage !== undefined && (
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Slippage (est.)</span>
          <span className="text-white font-medium">±{slippage}%</span>
        </div>
      )}
      {fee !== undefined && (
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Trading Fee</span>
          <span className="text-white font-medium">{fee}%</span>
        </div>
      )}
    </div>
  );
}
