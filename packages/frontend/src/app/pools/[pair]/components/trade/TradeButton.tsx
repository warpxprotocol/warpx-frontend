import React, { useEffect, useState } from 'react';
import { OrderType, TradeSide, useTradeOperations } from '@/app/features/trade/useTradeOperations';

interface TradeButtonProps {
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
}

export default function TradeButton({
  orderType,
  side,
  poolId,
  assetInId,
  assetOutId,
  amount,
  price,
  isValid,
  tokenIn,
  tokenOut
}: TradeButtonProps) {
  const { submitMarketOrder, submitLimitOrder, isSubmitting, isTradingSupported } = useTradeOperations();
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
      
      // Debug information for order submission
      console.log(`Submitting ${orderType} order:`, { 
        orderType, 
        side, 
        amount, 
        price, 
        poolId, 
        assetInId, 
        assetOutId,
        hasPrice: !!price,
        priceValue: price ? parseFloat(price) : 'none'
      });
      
      const params = {
        poolId,
        assetIn: assetInId,
        assetOut: assetOutId,
        amountIn: side === 'sell' ? amount : undefined,
        amountOut: side === 'buy' ? amount : undefined,
        price: orderType === 'limit' ? price : undefined,
        side
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
        await submitLimitOrder(params);
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
    
    const actionText = side === 'buy' ? 'Buy' : 'Sell';
    const tokenText = side === 'buy' ? tokenOut : tokenIn;
    
    return `${actionText} ${tokenText}`;
  };

  return (
    <button 
      className="bg-teal-500 text-[11px] font-medium text-black p-1.5 w-full hover:bg-teal-600 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition"
      onClick={handleSubmit}
      disabled={!apiSupportsTrading || !isValid || isSubmitting || !amount || (orderType === 'limit' && !price)}
    >
      {isSubmitting ? 'Processing...' : getButtonText()}
    </button>
  );
}
