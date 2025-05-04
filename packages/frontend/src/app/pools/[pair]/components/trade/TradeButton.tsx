import React, { useEffect, useState } from 'react';

import {
  OrderType,
  TradeSide,
  useTradeOperations,
} from '@/app/features/trade/useTradeOperations';

export interface TradeButtonProps {
  orderType: OrderType;
  side: TradeSide;
  poolId: number;
  assetInId: number;
  assetOutId: number;
  amount: string;
  price: string;
  isValid: boolean;
  tokenIn: string;
  tokenOut: string;
  decimals: number;
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
  baseAsset: number;
  quoteAsset: number;
  quantity: string;
  isBid: boolean;
}

export default function TradeButton({
  orderType,
  side,
  amount,
  price,
  isValid,
  tokenIn,
  tokenOut,
  decimals,
  onSubmit,
  isSubmitting,
  baseAsset,
  quoteAsset,
  quantity,
  isBid,
}: TradeButtonProps) {
  const { submitMarketOrder, submitLimitOrder, isTradingSupported } = useTradeOperations();
  const [apiSupportsTrading, setApiSupportsTrading] = useState<boolean>(true);

  // Check if the API supports trading operations
  useEffect(() => {
    const supported = isTradingSupported();
    console.log('API supports trading:', supported);
    // For now, always enable trading for testing
    setApiSupportsTrading(true);
  }, [isTradingSupported]);

  const handleSubmit = async () => {
    try {
      if (!apiSupportsTrading) {
        alert('Trading operations are not supported by the current API');
        return;
      }

      const params = {
        baseAsset,
        quoteAsset,
        quantity,
        isBid,
        price,
      };

      if (orderType === 'market') {
        await submitMarketOrder(params);
      } else {
        // For limit orders, make sure price is set
        if (!price || parseFloat(price) <= 0) {
          alert('Please enter a valid price for limit orders');
          return;
        }
        console.log('Submitting limit order with params:', params);
        await submitLimitOrder({
          baseAsset: baseAsset,
          quoteAsset: quoteAsset,
          quantity: amount,
          isBid: side === 'buy',
          price,
        });
        console.log('LIMIT ORDER PARAMS', {
          baseAsset,
          quoteAsset,
          amount,
          price,
          isBid: side === 'buy',
        });
      }
    } catch (error) {
      console.error('Trade submission error:', error);
      alert(`Trade error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Determine button text based on order type, side, and validity
  const getButtonText = () => {
    if (!apiSupportsTrading) {
      return 'Trading Not Available';
    }

    if (!isValid) {
      return 'Invalid Order';
    }

    const orderTypeText = orderType === 'market' ? 'market' : 'limit';
    const actionText = side === 'buy' ? 'Buy' : 'Sell';
    const tokenText = side === 'buy' ? tokenOut : tokenIn;

    return `${actionText} ${orderTypeText} ${tokenText}`;
  };

  return (
    <button
      className="bg-teal-500 text-[11px] font-medium text-black p-1.5 w-full hover:bg-teal-600 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition"
      onClick={onSubmit || handleSubmit}
      disabled={
        !apiSupportsTrading ||
        !isValid ||
        isSubmitting ||
        !amount ||
        (orderType === 'limit' && !price)
      }
    >
      {isSubmitting ? 'Processing...' : getButtonText()}
    </button>
  );
}
