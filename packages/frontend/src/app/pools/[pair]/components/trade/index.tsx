'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { OrderType, TradeSide } from '@/app/features/trade/useTradeOperations';
import { useTradeOperations } from '@/app/features/trade/useTradeOperations';
import { usePoolDataStore } from '@/app/pools/[pair]/context/PoolDataContext';
import { useApi } from '@/hooks/useApi';

import SideToggle from './SideToggle';
import TradeButton from './TradeButton';
import TradeInfo from './TradeInfo';
import TradeInput from './TradeInput';
import TradeSlider from './TradeSlider';
import TradeTabs from './TradeTabs';

interface AssetPair {
  baseAsset: string;
  quoteAsset: string;
  baseAssetId: number;
  quoteAssetId: number;
}

export default function TradeSection({
  baseAssetId,
  quoteAssetId,
}: {
  baseAssetId?: number;
  quoteAssetId?: number;
}) {
  // Order state
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<TradeSide>('buy');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [percent, setPercent] = useState(47);
  const [isValid, setIsValid] = useState(false);

  // Asset pair information
  const [assetPair, setAssetPair] = useState<AssetPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get pair from URL
  const params = useParams();
  const pair = params?.pair as string;

  // Decoded token information
  const [tokenIn, setTokenIn] = useState('USDC');
  const [tokenOut, setTokenOut] = useState('WBTC');
  const [assetInId, setAssetInId] = useState(1);
  const [assetOutId, setAssetOutId] = useState(2);
  const [poolId, setPoolId] = useState(0);

  // Mock available balance
  const availableBalance = '1000.00';

  const { api, isLoading: isApiLoading } = useApi();

  const poolInfo = usePoolDataStore((state) => state.poolInfo);
  const { submitMarketOrder, submitLimitOrder, isSubmitting, isTradingSupported } =
    useTradeOperations(poolInfo ?? undefined);

  // Parse asset information from the pair parameter
  useEffect(() => {
    if (!pair || !api || isApiLoading) return;

    const parseAssetPair = async () => {
      try {
        setIsLoading(true);

        // Parse pair information
        const decodedPair = decodeURIComponent(pair);
        const pairParts = decodedPair.split('/');

        if (pairParts.length !== 2) {
          console.error('Invalid trading pair format');
          return;
        }

        const baseAsset = pairParts[0];
        const quoteAsset = pairParts[1];

        console.log(`Processing trading pair: ${baseAsset}/${quoteAsset}`);

        setTokenOut(baseAsset);
        setTokenIn(quoteAsset);

        // In a real implementation, you would fetch asset IDs from an API
        // For now we're using mock IDs based on the URL
        const mockBaseAssetId = pairParts[0] === 'WARPBX' ? 2 : 1;
        const mockQuoteAssetId = pairParts[1] === 'WARPA' ? 3 : 2;

        // Would need to get real asset IDs from chain in production
        setAssetOutId(mockBaseAssetId);
        setAssetInId(mockQuoteAssetId);
        setPoolId(1); // Default pool ID for now

        // Store the asset pair information
        setAssetPair({
          baseAsset,
          quoteAsset,
          baseAssetId: mockBaseAssetId,
          quoteAssetId: mockQuoteAssetId,
        });

        console.log(
          `Trading pair set - base: ${baseAsset}(${mockBaseAssetId}), quote: ${quoteAsset}(${mockQuoteAssetId})`,
        );
      } catch (error) {
        console.error('Error parsing asset pair:', error);
      } finally {
        setIsLoading(false);
      }
    };

    parseAssetPair();
  }, [pair, api, isApiLoading]);

  // Handle order type changes
  const handleOrderTypeChange = (type: OrderType) => {
    console.log(`Switching order type from ${orderType} to ${type}`);
    setOrderType(type);

    // If switching to market, reset price validation
    if (type === 'market') {
      // Don't reset price value, just update validation
      setIsValid(Boolean(amount && parseFloat(amount) > 0));
    } else {
      // For limit orders, require valid price
      const amountValid = amount && parseFloat(amount) > 0;
      const priceValid = price && parseFloat(price) > 0;
      setIsValid(Boolean(amountValid && priceValid));
    }
  };

  // Validate the order
  useEffect(() => {
    // Basic validation - just check the amount and price are valid
    const amountValid = amount && parseFloat(amount) > 0;
    const priceValid = orderType === 'market' || (price && parseFloat(price) > 0);

    console.log('Order validation:', {
      orderType,
      amount,
      price,
      amountValid,
      priceValid,
      isValid: Boolean(amountValid && priceValid),
    });

    setIsValid(Boolean(amountValid && priceValid));
  }, [amount, price, orderType]);

  // Update amount based on slider percentage
  useEffect(() => {
    if (percent > 0) {
      // This would calculate the amount based on available balance
      const calculatedAmount = (parseFloat(availableBalance) * (percent / 100)).toFixed(6);
      setAmount(calculatedAmount);
    }
  }, [percent, availableBalance]);

  return (
    <div
      className="bg-[#202027] flex flex-col min-w-0 h-full shadow-md p-3 max-w-[340px] mx-auto overflow-hidden"
      style={{ height: '100%' }}
    >
      <div className="flex flex-col gap-2 flex-1">
        <TradeTabs activeOrderType={orderType} setOrderType={handleOrderTypeChange} />
        <SideToggle side={side} setSide={setSide} />
        <TradeInput
          orderType={orderType}
          side={side}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amount={amount}
          setAmount={setAmount}
          price={price}
          setPrice={setPrice}
          availableBalance={availableBalance}
          poolInfo={poolInfo ?? undefined}
          decimals={
            side === 'buy' ? poolInfo?.quoteAssetDecimals : poolInfo?.baseAssetDecimals
          }
        />
        <TradeSlider percent={percent} setPercent={setPercent} />
        <TradeInfo />
      </div>
      <div className="mt-2">
        <TradeButton
          orderType={orderType}
          side={side}
          poolId={poolId}
          assetInId={assetInId}
          assetOutId={assetOutId}
          amount={amount}
          price={price}
          isValid={isValid}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          onSubmit={async () => {
            if (!poolInfo) return;
            const params = {
              poolId,
              assetIn: assetInId,
              assetOut: assetOutId,
              amountIn: side === 'sell' ? amount : undefined,
              amountOut: side === 'buy' ? amount : undefined,
              price: orderType === 'limit' ? price : undefined,
              side,
            };
            if (orderType === 'market') {
              await submitMarketOrder(params);
            } else {
              await submitLimitOrder(params);
            }
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
