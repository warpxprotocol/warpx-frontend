'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { OrderType, TradeSide } from '@/app/features/trade/useTradeOperations';
import { useTradeOperations } from '@/app/features/trade/useTradeOperations';
import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import Modal from '@/app/pools/[pair]/components/trade/modal';
import { usePoolDataStore } from '@/app/pools/[pair]/context/PoolDataContext';
import { useApi } from '@/hooks/useApi';

import MarketOrderSummary from './MarketOrderSummary';
import SideToggle from './SideToggle';
import TradeButton from './TradeButton';
import TradeInfo from './TradeInfo';
import TradeInput from './TradeInput';
import TradeInputMarket from './TradeInputMarket';
import TradeSlider from './TradeSlider';
import TradeTabs from './TradeTabs';

interface AssetPair {
  baseAsset: string;
  quoteAsset: string;
  baseAssetId: number;
  quoteAssetId: number;
}

function getFractionDigits(lotSize: number, decimals: number) {
  const humanLotSize = lotSize / 10 ** decimals;
  const str = humanLotSize.toString();
  if (str.includes('.')) {
    return str.split('.')[1].length;
  }
  return 0;
}

function toHumanAmount(raw: string, decimals: number) {
  return (Number(raw) / 10 ** decimals).toString();
}

function canSell(amount: string, decimals: number, availableBalance: string, minUnit = 1) {
  // 1. 문자열 → 숫자 변환 및 NaN 체크
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return { ok: false, reason: '수량 입력이 올바르지 않습니다.' };

  // 2. 최소 단위 이상인지 체크
  const rawAmount = BigInt(Math.floor(parsed * 10 ** decimals));
  if (rawAmount < BigInt(minUnit))
    return { ok: false, reason: `최소 주문 단위는 ${minUnit / 10 ** decimals} 입니다.` };

  // 3. 잔고 체크
  const balance = BigInt(availableBalance);
  if (rawAmount > balance) return { ok: false, reason: '잔고가 부족합니다.' };

  // 4. (Optional) 수수료 포함 체크는 별도 로직 필요

  return { ok: true, rawAmount };
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
  const [percent, setPercent] = useState(0);
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
  const [availableBalance, setAvailableBalance] = useState<string>('0');

  const { api, isLoading: isApiLoading } = useApi();
  const { connected, selectedAccount } = useWalletStore();

  const poolInfo = usePoolDataStore((state) => state.poolInfo);
  const { submitMarketOrder, submitLimitOrder, isSubmitting, isTradingSupported } =
    useTradeOperations(poolInfo ?? undefined);

  const [baseAssetDecimals, setBaseAssetDecimals] = useState<number>();
  const [quoteAssetDecimals, setQuoteAssetDecimals] = useState<number>();

  // base/quote asset 구분
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;
  const baseDecimals = baseAssetDecimals ?? 6;
  const quoteDecimals = quoteAssetDecimals ?? 6;

  // base asset 기준 잔액, lotSize, min/max
  const lotSize = poolInfo?.lotSize ?? 1;
  const lot = Number(lotSize);
  const baseDecimalsNum = Number(baseDecimals);
  const value = lot / 10 ** baseDecimalsNum;
  const fractionDigits = getFractionDigits(lot, baseDecimalsNum);

  console.log('DEBUG lotSize:', lotSize);
  console.log('DEBUG baseDecimals:', baseDecimals);
  console.log('DEBUG lot:', lot);
  console.log('DEBUG baseDecimalsNum:', baseDecimalsNum);
  console.log('DEBUG value:', value);
  console.log('DEBUG fractionDigits:', fractionDigits);

  const humanLotSize = useMemo(() => {
    if (!lotSize || !baseDecimals) return '';
    const lot = Number(lotSize);
    const baseDecimalsNum = Number(baseDecimals);
    if (isNaN(lot) || isNaN(baseDecimalsNum)) return '';
    const value = lot / 10 ** baseDecimalsNum;
    // 소수점 이하 자릿수 자동 계산
    let fractionDigits = 0;
    if (value < 1) {
      const str = value.toFixed(8);
      if (str.includes('.')) {
        fractionDigits = str.split('.')[1].replace(/0+$/, '').length;
      }
    } else {
      fractionDigits = 2;
    }
    return value.toLocaleString(undefined, {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    });
  }, [lotSize, baseDecimals]);
  const available = Number(availableBalance) / 10 ** baseDecimals;

  // input → 슬라이더 연동 (base asset 기준)
  const handleInputChange = (value: string) => {
    setAmount(value);
    const num = parseFloat(value);
    if (available > 0) {
      const calculatedPercent = (num / available) * 100;
      setPercent(Math.min(calculatedPercent, 100));
    } else {
      setPercent(0);
    }
  };

  // 슬라이더 → input 연동 (base asset 기준)
  const handleSliderChange = (v: number) => {
    setPercent(v);
    const calculatedAmount = (available * (v / 100)).toFixed(fractionDigits);
    setAmount(calculatedAmount);
  };

  // 예상 수령액 (quote asset)
  const marketPrice = poolInfo?.poolPrice ? Number(poolInfo.poolPrice) : 0;
  const orderValue = Number(amount) * marketPrice;

  // Show summary state
  const [showSummary, setShowSummary] = useState(false);

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

  useEffect(() => {
    const fetchDecimals = async () => {
      if (!api || !baseAssetId || !quoteAssetId) return;
      const baseMeta = await api.query.assets.metadata(baseAssetId);
      const quoteMeta = await api.query.assets.metadata(quoteAssetId);

      const baseMetaHuman = baseMeta.toHuman();
      const quoteMetaHuman = quoteMeta.toHuman();

      const baseDecimals =
        baseMetaHuman &&
        typeof baseMetaHuman === 'object' &&
        !Array.isArray(baseMetaHuman) &&
        'decimals' in baseMetaHuman
          ? baseMetaHuman.decimals
          : undefined;
      const quoteDecimals =
        quoteMetaHuman &&
        typeof quoteMetaHuman === 'object' &&
        !Array.isArray(quoteMetaHuman) &&
        'decimals' in quoteMetaHuman
          ? quoteMetaHuman.decimals
          : undefined;

      setBaseAssetDecimals(Number(baseDecimals));
      setQuoteAssetDecimals(Number(quoteDecimals));
    };
    fetchDecimals();
  }, [api, baseAssetId, quoteAssetId]);

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
      const calculatedAmount = (available * (percent / 100)).toFixed(2);
      setAmount(calculatedAmount);
    }
  }, [percent, available]);

  // 실제 잔액 조회
  useEffect(() => {
    const fetchBalance = async () => {
      if (!api || !selectedAccount) {
        setAvailableBalance('0');
        return;
      }
      try {
        // 항상 assetInId 기준으로 잔고 조회
        const balance = await api.query.assets.account(assetInId, selectedAccount);
        const json = balance.toJSON();
        const raw =
          json && typeof json === 'object' && 'balance' in json ? json.balance : '0';
        setAvailableBalance(raw?.toString() ?? '0');
      } catch (e) {
        setAvailableBalance('0');
      }
    };
    fetchBalance();
  }, [api, selectedAccount, assetInId]);

  useEffect(() => {
    if (!assetPair) return;
    if (side === 'buy') {
      setTokenIn(assetPair.quoteAsset); // 지불할 토큰
      setTokenOut(assetPair.baseAsset); // 구매할 토큰
    } else {
      setTokenIn(assetPair.baseAsset); // 판매할 토큰
      setTokenOut(assetPair.quoteAsset); // 받을 토큰
    }
  }, [side, assetPair]);

  const handleTradeClick = () => {
    setShowSummary(true);
  };

  const handleConfirmOrder = async () => {
    setShowSummary(false);
    if (orderType === 'market') {
      await submitMarketOrder({
        poolId,
        assetIn: assetInId,
        assetOut: assetOutId,
        amountIn: side === 'sell' ? amount : undefined,
        amountOut: side === 'buy' ? amount : undefined,
        side,
      });
    } else {
      // limit order 등 다른 타입 처리
    }
  };

  const availableToken = side === 'buy' ? quoteToken : baseToken;

  const [baseAssetBalance, setBaseAssetBalance] = useState('0');
  const [quoteAssetBalance, setQuoteAssetBalance] = useState('0');

  useEffect(() => {
    if (!api || !selectedAccount || !assetPair) return;
    api.query.assets.account(assetPair.baseAssetId, selectedAccount).then((res) => {
      const json = res.toJSON();
      const raw =
        json && typeof json === 'object' && 'balance' in json ? json.balance : '0';
      setBaseAssetBalance(raw?.toString() ?? '0');
    });
    api.query.assets.account(assetPair.quoteAssetId, selectedAccount).then((res) => {
      const json = res.toJSON();
      const raw =
        json && typeof json === 'object' && 'balance' in json ? json.balance : '0';
      setQuoteAssetBalance(raw?.toString() ?? '0');
    });
  }, [api, selectedAccount, assetPair]);

  const decimals = side === 'buy' ? quoteAssetDecimals : baseAssetDecimals;

  return (
    <div
      className="bg-[#202027] flex flex-col min-w-0 h-full shadow-md p-3 max-w-[340px] mx-auto overflow-hidden"
      style={{ height: '100%' }}
    >
      <div className="flex flex-col gap-2 flex-1">
        <TradeTabs activeOrderType={orderType} setOrderType={handleOrderTypeChange} />
        <SideToggle side={side} setSide={setSide} />
        <div className="flex gap-2 mb-2 flex-col">
          <TradeInput
            orderType={orderType}
            side={side}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            amount={amount}
            setAmount={setAmount}
            price={price}
            setPrice={setPrice}
            availableBalance={side === 'buy' ? quoteAssetBalance : baseAssetBalance}
            poolInfo={poolInfo ?? undefined}
            decimals={decimals}
            baseAssetBalance={baseAssetBalance}
            quoteAssetBalance={quoteAssetBalance}
          />
          {/* <div
            className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 flex items-center justify-center"
            style={{ minWidth: '70px' }}
          >
            {baseToken}
          </div> */}
        </div>
        <div className="text-[11px] text-gray-400 mb-2">
          <span>
            Minimum unit: {humanLotSize} {baseToken}
          </span>
        </div>
        <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
          <span>Max {side === 'buy' ? 'Buying Power' : 'Selling Amount'}</span>
          <span className="text-white font-medium">
            {available.toLocaleString(undefined, { maximumFractionDigits: fractionDigits })}{' '}
            {availableToken}
          </span>
        </div>
        <TradeSlider value={percent} onChange={handleSliderChange} />
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
          decimals={baseAssetDecimals ?? 6}
          onSubmit={handleTradeClick}
          isSubmitting={isSubmitting}
        />
      </div>
      {showSummary && (
        <Modal>
          <div className="bg-[#202027] px-6 py-3 rounded-xl shadow-2xl w-full max-w-[380px] mx-auto border border-[#353545]">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-green-500 font-bold text-lg">
                  Market {side === 'buy' ? 'Buy' : 'Sell'}
                </span>
                <span className="text-white font-bold text-lg ml-1">{baseToken}</span>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {/* 주문 요약 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 font-medium">Order Price</span>
                <span className="text-white font-medium">Market Price</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 font-medium">Qty</span>
                <span className="text-white font-medium">
                  ≈{Number(amount).toFixed(fractionDigits)} {baseToken}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Order Value</span>
                <div className="flex flex-col items-end">
                  <span className="text-white font-medium">
                    {orderValue.toLocaleString(undefined, {
                      maximumFractionDigits: quoteDecimals,
                    })}{' '}
                    {quoteToken}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ≈{orderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                    USD
                  </span>
                </div>
              </div>
            </div>
            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmOrder}
                className="flex-1 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition"
              >
                {side === 'sell' ? `Sell ${baseToken}` : `Buy ${baseToken}`}
              </button>
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 py-2 rounded-lg border border-[#353545] text-white font-bold hover:bg-[#23232b] transition"
              >
                No
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
