/**
 * Creates a limit order extrinsic
 */
const createLimitOrderExtrinsic = useCallback(
  (params: TradeParameters): SubmittableExtrinsic<'promise', ISubmittableResult> | null => {
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
        const integerAmount = convertToInteger(amount || '0');
        const integerPrice = convertToInteger(price || '0');

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
