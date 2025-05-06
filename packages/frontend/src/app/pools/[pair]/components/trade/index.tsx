'use client';

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { OrderType, TradeSide } from '@/app/features/trade/useTradeOperations';
import { useTradeOperations } from '@/app/features/trade/useTradeOperations';
import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import Modal from '@/app/pools/[pair]/components/trade/modal';
import { usePoolDataStore } from '@/app/pools/[pair]/context/PoolDataContext';
import { useApi } from '@/hooks/useApi';

import OrderSummary from './MarketOrderSummary';
import SideToggle from './SideToggle';
import TradeButton from './TradeButton';
import TradeInput from './TradeInput';
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
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [percent, setPercent] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Asset pair information
  const [assetPair, setAssetPair] = useState<AssetPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get pair from URL
  const params = useParams();
  const searchParams = useSearchParams();
  const pair = params?.pair as string;

  // 쿼리 파라미터에서 읽어올 때는 변수명 다르게!
  const baseAssetIdParam = searchParams.get('baseId');
  const quoteAssetIdParam = searchParams.get('quoteId');

  // 실제 사용할 id
  const baseAssetIdFinal =
    baseAssetId ?? (baseAssetIdParam ? Number(baseAssetIdParam) : undefined);
  const quoteAssetIdFinal =
    quoteAssetId ?? (quoteAssetIdParam ? Number(quoteAssetIdParam) : undefined);

  // Decoded token information
  const [tokenIn, setTokenIn] = useState<string>();
  const [tokenOut, setTokenOut] = useState<string>();
  const [assetInId, setAssetInId] = useState<number>();
  const [assetOutId, setAssetOutId] = useState<number>();

  // Mock available balance
  const [availableBalance, setAvailableBalance] = useState<string>('0');

  const { api, isLoading: isApiLoading } = useApi();
  const { connected, selectedAccount } = useWalletStore();

  const poolInfo = usePoolDataStore((state) => state.poolInfo);
  const poolMetadata = usePoolDataStore((state) => state.metadata);
  const { submitMarketOrder, submitLimitOrder, isSubmitting, isTradingSupported } =
    useTradeOperations(poolInfo ?? undefined);
  const apiSupportsTrading = isTradingSupported();

  const [baseAssetDecimals, setBaseAssetDecimals] = useState<number>();
  const [quoteAssetDecimals, setQuoteAssetDecimals] = useState<number>();

  // base/quote asset 구분
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;
  const baseDecimals = poolMetadata?.baseDecimals;
  const quoteDecimals = poolMetadata?.quoteDecimals;

  // base asset 기준 잔액, lotSize, min/max
  const baseDecimalsNum = Number(baseDecimals);
  const lotSize =
    baseDecimals && poolMetadata?.poolDecimals
      ? 10 ** (baseDecimals - poolMetadata.poolDecimals)
      : undefined;
  const minUnit = lotSize && baseDecimals ? lotSize / 10 ** baseDecimals : undefined;

  const fractionDigits = getFractionDigits(lotSize ?? 1, baseDecimalsNum);

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
  const available =
    lotSize && baseDecimals ? Number(availableBalance) / 10 ** baseDecimals : 0;

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

  // Parse asset information from the pair parameter
  useEffect(() => {
    if (!pair || !api || isApiLoading) return;

    const parseAssetPair = async () => {
      try {
        setIsLoading(true);

        const decodedPair = decodeURIComponent(pair);
        const pairParts = decodedPair.split('/');

        if (pairParts.length !== 2) {
          console.error('Invalid trading pair format');
          return;
        }

        const baseAsset = pairParts[0];
        const quoteAsset = pairParts[1];

        // 쿼리 파라미터에서 assetId 가져오기
        const baseAssetId = searchParams.get('baseId');
        const quoteAssetId = searchParams.get('quoteId');

        setAssetOutId(Number(baseAssetId));
        setAssetInId(Number(quoteAssetId));

        setAssetPair({
          baseAsset,
          quoteAsset,
          baseAssetId: Number(baseAssetId),
          quoteAssetId: Number(quoteAssetId),
        });

        console.log(
          `Trading pair set - base: ${baseAsset}(${baseAssetId}), quote: ${quoteAsset}(${quoteAssetId})`,
        );
      } catch (error) {
        console.error('Error parsing asset pair:', error);
      } finally {
        setIsLoading(false);
      }
    };

    parseAssetPair();
  }, [pair, api, isApiLoading, searchParams]);

  useEffect(() => {
    const fetchDecimals = async () => {
      if (!api || !baseAssetIdFinal || !quoteAssetIdFinal) return;
      const baseMeta = await api.query.assets.metadata(baseAssetIdFinal);
      const quoteMeta = await api.query.assets.metadata(quoteAssetIdFinal);

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
  }, [api, baseAssetIdFinal, quoteAssetIdFinal]);

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
    const amountValid = amount && parseFloat(amount) > 0;
    const priceValid = orderType === 'market' || (price && parseFloat(price) > 0);
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
    // This function is no longer used
  };

  const handleSubmit = async () => {
    try {
      if (!apiSupportsTrading) {
        alert('Trading operations are not supported by the current API');
        return;
      }

      if (baseAssetIdFinal == null || quoteAssetIdFinal == null) {
        alert('Asset IDs are not set');
        return;
      }

      // orderType이 market이면 market order만 처리
      if (orderType === 'market') {
        if (side === 'buy') {
          await submitMarketOrder({
            baseAsset: baseAssetIdFinal,
            quoteAsset: quoteAssetIdFinal,
            quantity: amount,
            isBid: true,
          });
        } else {
          await submitMarketOrder({
            baseAsset: baseAssetIdFinal,
            quoteAsset: quoteAssetIdFinal,
            quantity: amount,
            isBid: false,
          });
          console.log('DEBUG submitMarketOrder:', {
            baseAsset: baseAssetIdFinal,
            quoteAsset: quoteAssetIdFinal,
            quantity: amount,
            isBid: false,
          });
        }
        return;
      }

      // orderType이 limit일 때만 아래 코드 실행
      if (!price || parseFloat(price) <= 0) {
        alert('Please enter a valid price for limit orders');
        return;
      }
      console.log('Submitting limit order with params:', {
        baseAsset: baseAssetIdFinal,
        quoteAsset: quoteAssetIdFinal,
        quantity: amount,
        isBid: side === 'buy',
        price,
        poolInfo,
      });
      await submitLimitOrder({
        baseAsset: baseAssetIdFinal,
        quoteAsset: quoteAssetIdFinal,
        quantity: amount,
        isBid: side === 'buy',
        price,
      });
    } catch (error) {
      console.log('DEBUG error:', error);
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

  const decimals =
    side === 'buy' ? poolMetadata?.quoteDecimals : poolMetadata?.baseDecimals;

  const minUnitStr =
    minUnit !== undefined && baseDecimalsNum !== undefined
      ? minUnit.toLocaleString(undefined, {
          minimumFractionDigits: baseDecimalsNum,
          maximumFractionDigits: baseDecimalsNum,
        })
      : '';

  const tokenInDecimals =
    side === 'buy' ? poolMetadata?.quoteDecimals : poolMetadata?.baseDecimals;

  const tokenOutDecimals =
    side === 'buy' ? poolMetadata?.baseDecimals : poolMetadata?.quoteDecimals;

  // console.log('poolMetadata:', poolMetadata);
  return (
    <div
      className="bg-[#0f0f0f] flex flex-col min-w-0 h-full shadow-md p-3 max-w-[340px] mx-auto overflow-hidden border border-gray-800"
      style={{ height: '100%' }}
    >
      <div className="flex flex-col gap-2 flex-1">
        <TradeTabs activeOrderType={orderType} setOrderType={handleOrderTypeChange} />
        <SideToggle side={side} setSide={setSide} />
        <div className="flex gap-2 mb-2 flex-col min-w-[250px]">
          <TradeInput
            orderType={orderType}
            side={side}
            tokenIn={tokenIn ?? ''}
            tokenOut={tokenOut ?? ''}
            amount={amount}
            setAmount={setAmount}
            price={price}
            setPrice={setPrice}
            availableBalance={side === 'buy' ? quoteAssetBalance : baseAssetBalance}
            poolInfo={poolInfo ?? undefined}
            poolMetadata={poolMetadata ?? undefined}
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
            Minimum unit: {minUnit} {baseToken}
          </span>
        </div>
        {/* <TradeInfo /> */}
        <div className="mt-2">
          <OrderSummary
            orderType={orderType}
            side={side}
            amount={Number(amount)}
            baseToken={baseToken ?? ''}
            quoteToken={quoteToken ?? ''}
            price={
              orderType === 'market'
                ? Number(poolInfo?.poolPrice) / 10 ** (poolInfo?.poolDecimals ?? 2)
                : Number(price)
            }
            lotSize={lotSize ?? 0}
            decimals={
              Number.isFinite(baseDecimalsNum) && baseDecimalsNum >= 0 ? baseDecimalsNum : 0
            }
          />
        </div>
        <TradeButton
          orderType={orderType}
          side={side}
          baseAsset={baseAssetIdFinal!}
          quoteAsset={quoteAssetIdFinal!}
          quantity={amount}
          isBid={side === 'buy'}
          amount={amount}
          price={price}
          isValid={isValid}
          tokenIn={tokenIn ?? ''}
          tokenOut={tokenOut ?? ''}
          decimals={baseAssetDecimals ?? 6}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          assetInId={assetInId ?? 0}
          assetOutId={assetOutId ?? 0}
        />
      </div>
    </div>
  );
}
