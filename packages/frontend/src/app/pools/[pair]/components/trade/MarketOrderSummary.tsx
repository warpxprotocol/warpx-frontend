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
  onClose,
  onSubmit,
  slippage,
  fee,
}: OrderSummaryProps & { onClose: () => void; onSubmit: () => void }) {
  const isBuy = side === 'buy';
  const qty = amount;
  const orderValue = Number(amount) * Number(price);

  return (
    <div className="bg-black px-6 py-3 rounded-xl shadow-2xl w-full max-w-[380px] mx-auto border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-white font-bold text-lg">
            {orderType === 'market'
              ? `Market ${side === 'buy' ? 'Buy' : 'Sell'}`
              : `Limit ${side === 'buy' ? 'Buy' : 'Sell'}`}
          </span>
          <span className="text-white font-bold text-lg ml-1">{baseToken}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Order Price</span>
        <span className="text-white font-medium">
          {orderType === 'market'
            ? `~${price.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${quoteToken}`
            : `${price.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${quoteToken}`}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Quantity</span>
        <span className="text-white font-medium">
          {qty.toLocaleString(undefined, { maximumFractionDigits: decimals })} {baseToken}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Order Value</span>
        <span className="text-white font-medium">
          {orderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {quoteToken}
        </span>
      </div>
      {slippage !== undefined && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Slippage (est.)</span>
          <span className="text-white font-medium">±{slippage}%</span>
        </div>
      )}
      {fee !== undefined && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Trading Fee</span>
          <span className="text-white font-medium">{fee}%</span>
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2 text-right">
        Minimum unit: {formatLotSize(lotSize, decimals)} {baseToken}
      </div>
      <div className="flex gap-2 mt-8 text-xs">
        <button
          onClick={onSubmit}
          className="flex-1 py-2 rounded-lg transition bg-white text-black hover:bg-gray-200"
        >
          {side === 'sell' ? `Sell ${baseToken}` : `Buy ${baseToken}`}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-lg bg-transparent text-gray-400 font-bold hover:text-white transition border-none shadow-none"
          style={{ background: 'none', border: 'none' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
