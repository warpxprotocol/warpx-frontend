import React from 'react';
import { OrderType, TradeSide } from '@/app/features/trade/useTradeOperations';

interface TradeInputProps {
  orderType: OrderType;
  side: TradeSide;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  setAmount: (amount: string) => void;
  price: string;
  setPrice: (price: string) => void;
  availableBalance: string;
}

export default function TradeInput({
  orderType,
  side,
  tokenIn,
  tokenOut,
  amount,
  setAmount,
  price,
  setPrice,
  availableBalance
}: TradeInputProps) {
  const activeToken = side === 'buy' ? tokenOut : tokenIn;
  
  return (
    <>
      <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
        <span>Available</span>
        <span className="text-white font-medium">{availableBalance} {activeToken}</span>
      </div>
      
      {/* Size Input */}
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none transition"
          style={{ borderRadius: 0 }}
          placeholder="Size"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
        />
        <select
          className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none"
          style={{ borderRadius: 0 }}
          value={activeToken}
          disabled
        >
          <option>{activeToken}</option>
        </select>
      </div>
      
      {/* Price Input - Only for Limit Orders */}
      {orderType === 'limit' && (
        <div className="mb-2">
          <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
            <span>Price</span>
            {price && parseFloat(price) > 0 ? (
              <span className="text-green-400">✓ Valid Price</span>
            ) : (
              <span className="text-red-400">Enter Price</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none transition"
              style={{ borderRadius: 0 }}
              placeholder="Price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                console.log('Price changed:', e.target.value);
              }}
              type="number"
              min="0"
              step="0.000001"
              required={orderType === 'limit'}
            />
            <div
              className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 flex items-center justify-center"
              style={{ minWidth: '70px' }}
            >
              {side === 'buy' ? tokenIn : tokenOut}/{activeToken}
            </div>
          </div>
          <div className="mt-1 text-[10px] text-amber-400">
            Note: Limit orders are submitted without decimal points. For example, 1.5 will be sent as 15.
          </div>
        </div>
      )}
      
      {/* Total - Only for Limit Orders */}
      {orderType === 'limit' && price && amount && (
        <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
          <span>Total</span>
          <span className="text-white font-medium">
            {(parseFloat(price) * parseFloat(amount || '0')).toFixed(6)} {side === 'buy' ? tokenIn : tokenOut}
          </span>
        </div>
      )}
    </>
  );
}
