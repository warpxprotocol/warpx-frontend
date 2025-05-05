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

interface MarketOrderParameters {
  baseAsset: number;
  quoteAsset: number;
  quantity: string;
  isBid: boolean;
}

interface LimitOrderParameters {
  baseAsset: number;
  quoteAsset: number;
  isBid: boolean;
  price: string;
  quantity: string;
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
    } else {
      setIsWalletReady(false);
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
  function formatMarketOrderParams(params: MarketOrderParameters) {
    if (!poolInfo) throw new Error('Pool info is not available');

    const { quantity, baseAsset, quoteAsset } = params;

    const decimals = poolInfo.baseAssetDecimals ?? 0;

    return {
      ...params,
      quantity: toChainAmount(quantity, decimals),
      baseAsset: baseAsset,
      quoteAsset: quoteAsset,
    };
  }

  function formatLimitOrderParams(params: LimitOrderParameters) {
    if (!poolInfo) throw new Error('Pool info is not available');

    const { quantity, baseAsset, quoteAsset, price, isBid } = params;

    // For limit orders, quantity should be in base asset decimals
    const baseDecimals = poolInfo.baseAssetDecimals ?? 0;
    const chainQuantity = toChainAmount(quantity, baseDecimals);

    // Price should be in pool decimals
    const poolDecimals = poolInfo.poolDecimals ?? 0;
    const chainPrice = toChainAmount(price, poolDecimals);

    return {
      ...params,
      quantity: chainQuantity, // Keep the original quantity without adjustment
      baseAsset: baseAsset,
      quoteAsset: quoteAsset,
      price: chainPrice,
    };
  }

  /**
   * Creates a market order extrinsic
   */
  const createMarketOrderExtrinsic = useCallback(
    async (params: MarketOrderParameters) => {
      const formatted = formatMarketOrderParams(params);
      if (!api || isLoading) return null;

      const { baseAsset, quoteAsset, quantity, isBid } = formatted;

      if (isBid && !quantity) {
        throw new Error('Quantity is required for buy orders');
      }

      if (!isBid && !quantity) {
        throw new Error('Quantity is required for sell orders');
      }

      try {
        // Based on error logs, marketOrder expects 4 arguments
        if (
          api.tx.hybridOrderbook &&
          typeof api.tx.hybridOrderbook.marketOrder === 'function'
        ) {
          const isBuy = isBid;
          const amount = quantity;

          const baseAssetEnum = toAssetEnum(poolInfo?.baseAssetId ?? 0);
          const quoteAssetEnum = toAssetEnum(poolInfo?.quoteAssetId ?? 0);
          const poolKey = [baseAssetEnum, quoteAssetEnum];

          const poolOpt = await api.query.hybridOrderbook.pools(poolKey);
          const poolJson =
            typeof poolOpt?.toJSON === 'function' ? poolOpt.toJSON() : undefined;

          const pool = poolOpt && poolOpt.toJSON && poolOpt.toJSON();

          return api.tx.hybridOrderbook.marketOrder(
            baseAssetEnum,
            quoteAssetEnum,
            amount,
            isBuy,
          );
        }

        // Option 2: dex module
        if (api.tx.dex) {
          if (isBid) {
            // Adjust parameter order if needed for dex module
            return api.tx.dex.swapExactOutputForInput(
              baseAsset,
              quoteAsset,
              quantity,
              null, // No limit for market orders
            );
          } else {
            return api.tx.dex.swapExactInputForOutput(
              baseAsset,
              quoteAsset,
              quantity,
              null, // No limit for market orders
            );
          }
        }

        // Option 3: warpx module
        if (api.tx.warpx) {
          if (isBid) {
            return api.tx.warpx.swapExactOutputForInput(
              baseAsset,
              quoteAsset,
              quantity,
              null, // No limit for market order
            );
          } else {
            return api.tx.warpx.swapExactInputForOutput(
              baseAsset,
              quoteAsset,
              quantity,
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
          // Add handling for other modules if needed
        }

        return null;
      } catch (error) {
        return null;
      }
    },
    [api, isLoading, poolInfo],
  );

  /**
   * Creates a limit order extrinsic
   */
  const createLimitOrderExtrinsic = useCallback(
    (params: LimitOrderParameters) => {
      const formatted = formatLimitOrderParams(params);
      if (!api || isLoading) return null;

      const { baseAsset, quoteAsset, price, quantity, isBid } = formatted;

      if (!quantity) {
        throw new Error('Quantity is required for limit orders');
      }

      try {
        if (
          api.tx.hybridOrderbook &&
          typeof api.tx.hybridOrderbook.limitOrder === 'function'
        ) {
          const baseAssetObj = createAssetIdObject(Number(baseAsset));
          const quoteAssetObj = createAssetIdObject(Number(quoteAsset));
          const priceBN = BigInt(price);
          const quantityBN = BigInt(quantity);

          return api.tx.hybridOrderbook.limitOrder(
            baseAssetObj,
            quoteAssetObj,
            isBid,
            priceBN,
            quantityBN,
          );
        }

        // Option 2: Use any available swapExactOutputForInput / swapExactInputForOutput methods
        // Check all available modules for these methods
        for (const moduleName of Object.keys(api.tx)) {
          const module = api.tx[moduleName];

          // Check if the module has the needed swap methods
          if (params.isBid && typeof module.swapExactOutputForInput === 'function') {
            try {
              return module.swapExactOutputForInput(
                baseAsset,
                quoteAsset,
                quantity,
                params.price, // Max price for limit order
              );
            } catch (err) {}
          } else if (
            !params.isBid &&
            typeof module.swapExactInputForOutput === 'function'
          ) {
            try {
              return module.swapExactInputForOutput(
                baseAsset,
                quoteAsset,
                quantity,
                params.price, // Min price for limit order
              );
            } catch (err) {}
          }
        }

        // Fallback: Use the generic marketOrder method as a last resort
        if (
          api.tx.hybridOrderbook &&
          typeof api.tx.hybridOrderbook.marketOrder === 'function'
        ) {
          // Parameters for the generic marketOrder method
          // Format is expected to be: marketOrder(poolId, isBuy, assetIn, assetOut, amount)
          const isBuy = params.isBid;
          const amount = quantity;

          return api.tx.hybridOrderbook.marketOrder(
            baseAsset,
            quoteAsset,
            amount,
            isBuy, // true for buy, false for sell
          );
        }

        return null;
      } catch (error) {
        return null;
      }
    },
    [api, isLoading],
  );

  /**
   * Submits a market order
   */
  const submitMarketOrder = useCallback(
    async (params: MarketOrderParameters) => {
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

        const { isBid } = params;
        const actionType = isBid ? 'buying' : 'selling';

        // Get the proper signer using the utility function
        const { signer, address } = await getAccountSigner(selectedAccount);

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

        return result;
      } catch (error) {
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
    async (params: LimitOrderParameters) => {
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

        const { isBid } = params;
        const actionType = isBid ? 'buying' : 'selling';

        // Get the proper signer using the utility function
        const { signer, address } = await getAccountSigner(selectedAccount);

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

        return result;
      } catch (error) {
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
      return false;
    }

    // Check if wallet is connected
    if (!isWalletReady) {
      return false;
    }

    // Check for hybridOrderbook module
    const hasHybridOrderbook = !!api.tx.hybridOrderbook;

    // For development purposes, check for similar modules
    const possibleTradeModules = Object.keys(api.tx).filter(
      (module) =>
        module.toLowerCase().includes('order') ||
        module.toLowerCase().includes('trade') ||
        module.toLowerCase().includes('swap') ||
        module.toLowerCase().includes('pool'),
    );

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
