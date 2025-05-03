'use client';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useCallback, useEffect, useState } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { getAccountSigner } from '@/app/pools/[pair]/components/pools/utils';
import {
  PoolInfoDisplay,
  usePoolDataStore,
} from '@/app/pools/[pair]/context/PoolDataContext';
import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';

import { toChainAmount, toChainPrice } from './utils/ammount';

export type OrderType = 'market' | 'limit';
export type TradeSide = 'buy' | 'sell';

// market order는 baseasset 기준으로(decimal 고려해서) token quantiatiy 전달
// limit order는 baseasset 기준으로(decimal 고려해서), pool price 기준으로 설정해서 base Asset의 가격 전달

interface TradeParameters {
  poolId: number;
  assetIn: number;
  assetOut: number;
  amountIn?: string; // For selling
  amountOut?: string; // For buying
  price?: string; // For limit orders
  side: TradeSide;
}

export const useTradeOperations = (poolInfo?: PoolInfoDisplay) => {
  const { api, isLoading } = useApi();
  const { handleExtrinsic } = useExtrinsic();
  const { connected, selectedAccount } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);

  // Check if wallet is connected
  useEffect(() => {
    if (connected && selectedAccount) {
      setIsWalletReady(true);
      console.log('Wallet is ready for trading operations');
    } else {
      setIsWalletReady(false);
      console.log('Wallet is not ready, please connect wallet');
    }
  }, [connected, selectedAccount]);

  /**
   * Helper function to create a properly formatted asset ID object
   * The API expects an enum like { WithId: 123 } rather than just the number
   */
  const createAssetIdObject = (assetId: number) => {
    return { WithId: assetId };
  };

  const toAssetEnum = (id: number) => ({ WithId: id });

  // 주문 파라미터 변환 함수
  function formatOrderParams(params: TradeParameters) {
    if (!poolInfo) throw new Error('Pool info is not available');

    const { amountIn, amountOut, price, side, assetIn, assetOut } = params;
    const baseDecimals = poolInfo.baseAssetDecimals ?? 0;
    const quoteDecimals = poolInfo.quoteAssetDecimals ?? 0;
    const poolDecimals = poolInfo.poolDecimals ?? 0;

    // assetIn이 baseAsset이면 baseDecimals, quoteAsset이면 quoteDecimals
    const assetInDecimals = assetIn === poolInfo.baseAssetId ? baseDecimals : quoteDecimals;
    const assetOutDecimals =
      assetOut === poolInfo.baseAssetId ? baseDecimals : quoteDecimals;

    const baseAssetEnum = toAssetEnum(poolInfo.baseAssetId);
    const quoteAssetEnum = toAssetEnum(poolInfo.quoteAssetId);
    const poolKey = [baseAssetEnum, quoteAssetEnum];

    return {
      ...params,
      // ✅ 항상 assetIn 기준으로 amountIn 변환
      amountIn: amountIn ? toChainAmount(amountIn, assetInDecimals) : undefined,
      // ✅ 항상 assetOut 기준으로 amountOut 변환 (limit order 등에서 사용)
      amountOut: amountOut ? toChainAmount(amountOut, assetOutDecimals) : undefined,
      price: price ? toChainPrice(price, poolDecimals) : undefined,
    };
  }

  /**
   * Creates a market order extrinsic
   */
  const createMarketOrderExtrinsic = useCallback(
    async (params: TradeParameters) => {
      const formatted = formatOrderParams(params);
      if (!api || isLoading) return null;

      console.log('Creating market order extrinsic with params:', formatted);

      const { poolId, assetIn, assetOut, amountIn, amountOut, side } = formatted;

      if (side === 'buy' && !amountOut) {
        throw new Error('Amount out is required for buy orders');
      }

      if (side === 'sell' && !amountIn) {
        throw new Error('Amount in is required for sell orders');
      }

      try {
        // Based on error logs, marketOrder expects 4 arguments
        if (
          api.tx.hybridOrderbook &&
          typeof api.tx.hybridOrderbook.marketOrder === 'function'
        ) {
          console.log('Using hybridOrderbook.marketOrder method');

          const isBuy = side === 'buy';
          const amount = isBuy ? amountOut : amountIn;
          const integerAmount = amount || '0';

          // 최소 주문 단위 체크 (예: DOT은 1 Planck = 1, USDT는 1 micro = 1)
          const MIN_AMOUNT = 1;
          if (BigInt(integerAmount) < BigInt(MIN_AMOUNT)) {
            alert('주문 수량이 너무 작습니다. 최소 주문 단위를 확인해주세요.');
            return null;
          }

          // lotSize를 poolId로 직접 쿼리해서 가져온다고 가정
          const NATIVE_ID = 1; // 실제 네이티브 ID로 교체 필요
          const baseAssetEnum = toAssetEnum(poolInfo?.baseAssetId ?? 0);
          const quoteAssetEnum = toAssetEnum(poolInfo?.quoteAssetId ?? 0);
          const poolKey = [baseAssetEnum, quoteAssetEnum];

          const poolOpt = await api.query.hybridOrderbook.pools(poolKey);
          const poolJson =
            typeof poolOpt?.toJSON === 'function' ? poolOpt.toJSON() : undefined;
          const exists = !!(
            poolJson &&
            typeof poolJson === 'object' &&
            Object.keys(poolJson).length > 0
          );

          console.log('[Pool Check]', {
            base: baseAssetEnum,
            quote: quoteAssetEnum,
            exists,
          });

          const pool = poolOpt && poolOpt.toJSON && poolOpt.toJSON();
          const lotSize =
            pool && typeof pool === 'object' && 'lotSize' in pool && pool.lotSize
              ? pool.lotSize.toString()
              : '1';

          // 주문 수량이 lotSize의 배수인지 체크
          if (BigInt(integerAmount) % BigInt(lotSize) !== BigInt(0)) {
            alert(`주문 수량은 lot size(${lotSize})의 배수여야 합니다.`);
            return null;
          }

          console.log('Creating market order with params:', {
            poolId,
            isBuy,
            amount: integerAmount,
          });

          // Based on API documentation and the error message:
          // marketOrder(baseAsset: {WithId: number}, quoteAsset: {WithId: number}, quantity, isBid)
          // We need to format the asset IDs properly

          // Create properly formatted asset ID objects
          const baseAssetObj = createAssetIdObject(assetOut);
          const quoteAssetObj = createAssetIdObject(assetIn);

          console.log('Using marketOrder with corrected parameters: ', {
            baseAsset: baseAssetObj,
            quoteAsset: quoteAssetObj,
            integerAmount,
            isBuy,
          });

          console.log(
            '[DEBUG] amount:',
            amount,
            'side:',
            side,
            'baseDecimals:',
            poolInfo?.baseAssetDecimals ?? 0,
            'quoteDecimals:',
            poolInfo?.quoteAssetDecimals ?? 0,
          );
          console.log('[DEBUG] integerAmount:', integerAmount);

          return api.tx.hybridOrderbook.marketOrder(
            baseAssetEnum,
            quoteAssetEnum,
            integerAmount,
            isBuy,
          );
        }

        // Option 2: dex module
        if (api.tx.dex) {
          console.log('Using dex module for market order');
          if (side === 'buy') {
            // Adjust parameter order if needed for dex module
            return api.tx.dex.swapExactOutputForInput(
              assetOut,
              assetIn,
              amountOut,
              null, // No limit for market orders
            );
          } else {
            return api.tx.dex.swapExactInputForOutput(
              assetIn,
              assetOut,
              amountIn,
              null, // No limit for market orders
            );
          }
        }

        // Option 3: warpx module
        if (api.tx.warpx) {
          console.log('Using warpx module for market order');
          if (side === 'buy') {
            return api.tx.warpx.swapExactOutputForInput(
              poolId,
              assetOut,
              assetIn,
              amountOut,
              null, // No limit for market order
            );
          } else {
            return api.tx.warpx.swapExactInputForOutput(
              poolId,
              assetIn,
              assetOut,
              amountIn,
              null, // No limit for market order
            );
          }
        }

        // Option 4: Check for a generic swap module
        const possibleModules = Object.keys(api.tx).filter(
          (module) =>
            module.toLowerCase().includes('swap') ||
            module.toLowerCase().includes('pool') ||
            module.toLowerCase().includes('order'),
        );

        if (possibleModules.length > 0) {
          console.log(`Using ${possibleModules[0]} module as fallback`);
          // Add handling for other modules if needed
        }

        console.error('No suitable trading module found in the API');
        return null;
      } catch (error) {
        console.error('Error creating market order extrinsic:', error);
        return null;
      }
    },
    [api, isLoading, poolInfo],
  );

  /**
   * Creates a limit order extrinsic
   */
  const createLimitOrderExtrinsic = useCallback(
    (
      params: TradeParameters,
    ): SubmittableExtrinsic<'promise', ISubmittableResult> | null => {
      if (!api || isLoading) return null;

      console.log('Creating limit order extrinsic with params:', params);

      const { poolId, assetIn, assetOut, amountIn, amountOut, price, side } = params;

      if (!price) {
        throw new Error('Price is required for limit orders');
      }

      if (side === 'buy' && !amountOut) {
        throw new Error('Amount out is required for buy orders');
      }

      if (side === 'sell' && !amountIn) {
        throw new Error('Amount in is required for sell orders');
      }

      try {
        // List available methods for debugging
        if (api.tx.hybridOrderbook) {
          console.log(
            'Available hybridOrderbook methods:',
            Object.keys(api.tx.hybridOrderbook),
          );
        }

        // Try different module options based on what's available in the API
        // Option 1: hybridOrderbook module with limitOrder method
        if (
          api.tx.hybridOrderbook &&
          typeof api.tx.hybridOrderbook.limitOrder === 'function'
        ) {
          console.log('Using hybridOrderbook.limitOrder method');

          // Parameters for the generic limitOrder method
          // According to error: limitOrder expects 5 arguments, not 6
          // We need to figure out the exact parameter order
          const isBuy = side === 'buy';
          const amount = side === 'buy' ? amountOut : amountIn;

          // Based on the API documentation and error message:
          // limitOrder(baseAsset, quoteAsset, isBid, price, quantity)
          // Where baseAsset and quoteAsset must be formatted as { WithId: assetId }

          // Let's convert our decimal amounts to integers
          const baseDecimals = poolInfo?.baseAssetDecimals ?? 0;
          const quoteDecimals = poolInfo?.quoteAssetDecimals ?? 0;
          const integerAmount = toChainAmount(
            amount || '0',
            side === 'sell' ? baseDecimals : quoteDecimals,
          );
          const integerPrice = toChainAmount(price || '0', poolInfo?.poolDecimals ?? 0);

          // Create properly formatted asset ID objects
          const baseAssetObj = createAssetIdObject(assetOut); // The asset we want to trade
          const quoteAssetObj = createAssetIdObject(assetIn); // The asset we're paying with

          console.log('Using limitOrder with corrected parameters: ', {
            baseAsset: baseAssetObj,
            quoteAsset: quoteAssetObj,
            isBuy, // isBid
            integerPrice,
            integerAmount,
          });

          try {
            // Based on API documentation and the error message about enum format:
            // limitOrder(baseAsset: {WithId: number}, quoteAsset: {WithId: number}, isBid, price, quantity)
            return api.tx.hybridOrderbook.limitOrder(
              baseAssetObj, // Properly formatted asset ID object
              quoteAssetObj, // Properly formatted asset ID object
              isBuy, // isBid parameter
              integerPrice,
              integerAmount,
            );
          } catch (err) {
            console.error('limitOrder attempt failed, falling back to marketOrder:', err);

            // Fall back to marketOrder if limitOrder fails
            // Using the correct parameter structure with proper asset ID format:
            // marketOrder(baseAsset: {WithId: number}, quoteAsset: {WithId: number}, quantity, isBid)
            return api.tx.hybridOrderbook.marketOrder(
              baseAssetObj, // The asset we want to trade (assetOut) as an enum object
              quoteAssetObj, // The asset we're paying with (assetIn) as an enum object
              integerAmount,
              isBuy, // isBid parameter
            );
          }
        }

        // Option 2: Use any available swapExactOutputForInput / swapExactInputForOutput methods
        // Check all available modules for these methods
        for (const moduleName of Object.keys(api.tx)) {
          const module = api.tx[moduleName];

          // Check if the module has the needed swap methods
          if (side === 'buy' && typeof module.swapExactOutputForInput === 'function') {
            console.log(`Using ${moduleName}.swapExactOutputForInput for limit buy order`);
            try {
              return module.swapExactOutputForInput(
                assetOut,
                assetIn,
                amountOut,
                price, // Max price for limit order
              );
            } catch (err) {
              console.error(`Error using ${moduleName}.swapExactOutputForInput:`, err);
            }
          } else if (
            side === 'sell' &&
            typeof module.swapExactInputForOutput === 'function'
          ) {
            console.log(`Using ${moduleName}.swapExactInputForOutput for limit sell order`);
            try {
              return module.swapExactInputForOutput(
                assetIn,
                assetOut,
                amountIn,
                price, // Min price for limit order
              );
            } catch (err) {
              console.error(`Error using ${moduleName}.swapExactInputForOutput:`, err);
            }
          }
        }

        // Fallback: Use the generic marketOrder method as a last resort
        if (
          api.tx.hybridOrderbook &&
          typeof api.tx.hybridOrderbook.marketOrder === 'function'
        ) {
          console.log('FALLBACK: Using hybridOrderbook.marketOrder method for limit order');

          // Parameters for the generic marketOrder method
          // Format is expected to be: marketOrder(poolId, isBuy, assetIn, assetOut, amount)
          const isBuy = side === 'buy';
          const amount = side === 'buy' ? amountOut : amountIn;

          console.log('Creating market order as fallback with params:', {
            poolId,
            isBuy,
            assetIn,
            assetOut,
            amount,
          });

          return api.tx.hybridOrderbook.marketOrder(
            poolId,
            isBuy, // true for buy, false for sell
            assetIn,
            assetOut,
            amount,
          );
        }

        console.error('No suitable limit or market order methods found in the API');
        return null;
      } catch (error) {
        console.error('Error creating limit order extrinsic:', error);
        return null;
      }
    },
    [api, isLoading],
  );

  /**
   * Submits a market order
   */
  const submitMarketOrder = useCallback(
    async (params: TradeParameters) => {
      try {
        if (!isWalletReady) {
          throw new Error('Wallet is not connected. Please connect your wallet first.');
        }

        if (!selectedAccount) {
          throw new Error('No account selected. Please select an account first.');
        }

        setIsSubmitting(true);
        const extrinsic = await createMarketOrderExtrinsic(params);

        if (!extrinsic) {
          throw new Error(
            'Failed to create market order extrinsic. Please check the console for details.',
          );
        }

        const { side } = params;
        const actionType = side === 'buy' ? 'buying' : 'selling';

        console.log('Getting signer for account:', selectedAccount);

        // Get the proper signer using the utility function
        const { signer, address } = await getAccountSigner(selectedAccount);

        console.log('Submitting market order with signer:', {
          accountAddress: address,
          hasSigner: !!signer,
        });

        // Pass the selected account and signer to the extrinsic handler
        const result = await handleExtrinsic(
          extrinsic,
          {
            account: address,
            signer: signer,
          },
          {
            pending: `Processing ${actionType} order...`,
            success: `Market order ${actionType} successful`,
            error: `Market order failed`,
          },
        );

        console.log('Market order submitted successfully!');
        return result;
      } catch (error) {
        console.error('Market order error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createMarketOrderExtrinsic, handleExtrinsic, isWalletReady, selectedAccount],
  );

  /**
   * Submits a limit order
   */
  const submitLimitOrder = useCallback(
    async (params: TradeParameters) => {
      try {
        if (!isWalletReady) {
          throw new Error('Wallet is not connected. Please connect your wallet first.');
        }

        if (!selectedAccount) {
          throw new Error('No account selected. Please select an account first.');
        }

        setIsSubmitting(true);
        const extrinsic = createLimitOrderExtrinsic(params);

        if (!extrinsic) {
          throw new Error(
            'Failed to create limit order extrinsic. Please check the console for details.',
          );
        }

        const { side } = params;
        const actionType = side === 'buy' ? 'buying' : 'selling';

        console.log('Getting signer for account:', selectedAccount);

        // Get the proper signer using the utility function
        const { signer, address } = await getAccountSigner(selectedAccount);

        console.log('Submitting limit order with signer:', {
          accountAddress: address,
          hasSigner: !!signer,
        });

        // Pass the selected account and signer to the extrinsic handler
        const result = await handleExtrinsic(
          extrinsic,
          {
            account: address,
            signer: signer,
          },
          {
            pending: `Processing limit order for ${actionType}...`,
            success: `Limit order for ${actionType} placed successfully`,
            error: `Limit order failed`,
          },
        );

        console.log('Limit order submitted successfully!');
        return result;
      } catch (error) {
        console.error('Limit order error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createLimitOrderExtrinsic, handleExtrinsic, isWalletReady, selectedAccount],
  );

  /**
   * Check if the API supports trading operations and wallet is connected
   */
  const isTradingSupported = useCallback(() => {
    if (!api || isLoading) {
      console.log('API not ready:', { api: !!api, isLoading });
      return false;
    }

    // Check if wallet is connected
    if (!isWalletReady) {
      console.log('Wallet not connected. Please connect wallet to trade.');
      return false;
    }

    // Debug what modules and methods are available
    console.log('Available API modules:', Object.keys(api.tx));

    // Check for hybridOrderbook module
    const hasHybridOrderbook = !!api.tx.hybridOrderbook;
    console.log('Has hybridOrderbook module:', hasHybridOrderbook);

    if (hasHybridOrderbook) {
      // Log available methods on hybridOrderbook
      console.log('hybridOrderbook methods:', Object.keys(api.tx.hybridOrderbook));
    }

    // For development purposes, check for similar modules
    const possibleTradeModules = Object.keys(api.tx).filter(
      (module) =>
        module.toLowerCase().includes('order') ||
        module.toLowerCase().includes('trade') ||
        module.toLowerCase().includes('swap') ||
        module.toLowerCase().includes('pool'),
    );
    console.log('Possible trade-related modules:', possibleTradeModules);

    // For testing, we'll now only return true if both API and wallet are ready
    return hasHybridOrderbook && isWalletReady;
  }, [api, isLoading, isWalletReady]);

  return {
    submitMarketOrder,
    submitLimitOrder,
    isSubmitting,
    isTradingSupported,
  };
};
