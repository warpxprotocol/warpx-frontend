import React, { useEffect, useMemo, useState } from 'react';

import { TradeInputProps } from '@/app/pools/[pair]/components/trade/TradeInput';
import { useApi } from '@/hooks/useApi';
import { useDecimalInput } from '@/hooks/useDecimalInput';

import TradeSlider from './TradeSlider';

// 소수점 이하 자릿수 제한 상수
const DISPLAY_DECIMALS = 2;
const SLIDER_STEPS = [0, 25, 50, 75, 100];

function formatBalance(raw: string, decimals: number = 6) {
  if (!raw) return '0';
  return (Number(raw) / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: DISPLAY_DECIMALS,
    minimumFractionDigits: DISPLAY_DECIMALS,
  });
}

function formatDisplayAmount(amount: string) {
  if (!amount) return '';
  return Number(amount).toLocaleString(undefined, {
    maximumFractionDigits: DISPLAY_DECIMALS,
    minimumFractionDigits: DISPLAY_DECIMALS,
  });
}

function formatLotSize(lotSize: number, decimals: number) {
  return (lotSize / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: DISPLAY_DECIMALS,
    minimumFractionDigits: DISPLAY_DECIMALS,
  });
}

function getFractionDigits(lotSize: number, decimals: number) {
  const humanLotSize = lotSize / 10 ** decimals;
  const str = humanLotSize.toString();
  if (str.includes('.')) {
    return str.split('.')[1].length;
  }
  return 0;
}

function canSell(
  amount: string,
  decimals: number,
  availableBalance: string,
  minUnit = 1,
  existentialDeposit = 0,
  estimatedFee = 0,
) {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return { ok: false, reason: 'Quantity is not valid' };

  const rawAmount = BigInt(Math.floor(parsed * 10 ** decimals));
  if (rawAmount < BigInt(minUnit))
    return { ok: false, reason: `Minimum order unit is ${minUnit / 10 ** decimals}` };

  const balance = BigInt(availableBalance);
  const fee = BigInt(estimatedFee);
  const ed = BigInt(existentialDeposit);

  // 잔고 - 주문금액 - 수수료 ≥ ED
  if (balance - rawAmount - fee < ed)
    return {
      ok: false,
      reason: 'Insufficient balance',
    };
  if (rawAmount > balance) return { ok: false, reason: 'Insufficient balance' };

  return { ok: true, rawAmount };
}

function adjustToLotSize(
  amount: string,
  lotSize: string | number,
  direction: 'up' | 'down' = 'down',
) {
  const amt = BigInt(Math.floor(Number(amount)));
  const lot = BigInt(lotSize);
  if (lot === BigInt(0)) return amount; // lotSize 0이면 그대로 반환

  if (direction === 'up') {
    // 올림
    return (((amt + lot - BigInt(1)) / lot) * lot).toString();
  } else {
    // 내림
    return ((amt / lot) * lot).toString();
  }
}

function limitDecimals(value: string, decimals: number) {
  if (!value.includes('.')) return value;
  const [int, frac] = value.split('.');
  return frac.length > decimals ? `${int}.${frac.slice(0, decimals)}` : value;
}

function snapToDecimals(value: number, decimals: number) {
  return parseFloat(value.toFixed(decimals));
}

export default function TradeInputMarket({
  side,
  tokenIn,
  tokenOut,
  amount,
  setAmount,
  price,
  setPrice,
  availableBalance,
  baseAssetBalance,
  quoteAssetBalance,
  decimals,
  poolMetadata,
  poolInfo,
}: TradeInputProps & {
  baseAssetBalance: string;
  quoteAssetBalance: string;
  setPrice?: (v: string) => void;
}) {
  const baseDecimals = poolMetadata?.baseDecimals ?? decimals ?? 6;
  const lotSize = 1 / Math.pow(10, baseDecimals);

  // 자산 구분
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;
  const availableToken = side === 'buy' ? quoteToken : baseToken;

  const { api } = useApi();

  // lotSize, step 등은 항상 base asset 기준
  const [showAdjustmentMessage, setShowAdjustmentMessage] = useState(false);

  // Max Amount: Buy는 quote, Sell은 base 기준
  const poolDecimals = poolMetadata?.poolDecimals ?? 2;
  const tickSize = 1 / Math.pow(10, poolDecimals);

  // availableBalance는 이미 raw(정수) 단위임
  const intRawAmount = BigInt(availableBalance); // 예: 1000000000
  const intTickSize = BigInt(Math.round(tickSize * Math.pow(10, poolDecimals))); // 예: 1

  const adjustedAmount = adjustToLotSize(
    intRawAmount.toString(),
    intTickSize.toString(),
    'down',
  );
  const maxAmount = useMemo(() => {
    if (!availableBalance || !tickSize) return '0';
    if (side === 'buy') {
      // Buy: quote 잔고(availableBalance) 그대로(소수 변환)
      return (Number(availableBalance) / 10 ** (decimals ?? 6)).toString();
    } else {
      // Sell: base 잔고(availableBalance, raw)에서 tickSize(raw) 내림 적용
      const intRawAmount = BigInt(availableBalance); // raw 단위
      const intTickSize = BigInt(Math.round(tickSize * Math.pow(10, poolDecimals))); // raw 단위
      const adjustedAmount = adjustToLotSize(
        intRawAmount.toString(),
        intTickSize.toString(),
        'down',
      );
      // 결과를 소수로 변환
      return (Number(adjustedAmount) / Math.pow(10, poolDecimals)).toString();
    }
  }, [availableBalance, tickSize, decimals, side, poolDecimals]);

  // 예상 체결 가격 계산
  const estimatedPrice = poolInfo?.poolPrice ? Number(poolInfo.poolPrice) : 0;
  // You will receive 계산
  const youReceiveAmount =
    side === 'buy' ? Number(amount) / estimatedPrice : Number(amount) * estimatedPrice;

  // lotSize, step 등은 base 기준
  const humanLotSize = formatLotSize(lotSize, decimals ?? 6);

  // base/quote 입력값과 percent 상태
  const [baseValue, setBaseValue] = useState('');
  const [quoteValue, setQuoteValue] = useState('');
  const [percent, setPercent] = useState(0);

  // 사용 가능한 base 잔고 (슬라이더/percent 기준)
  const availableBase =
    Number(side === 'buy' ? baseAssetBalance : availableBalance) / 10 ** (decimals ?? 6);

  const quoteDecimals = decimals ?? 6;

  const baseStep = lotSize;

  const [quantity, handleQuantityChange, handleQuantityBlur, setQuantity] = useDecimalInput(
    amount ?? '',
    poolDecimals,
    tickSize,
  );

  useEffect(() => {
    setQuantity(amount ?? '');
  }, [amount, setQuantity]);

  useEffect(() => {
    setAmount(quantity);
  }, [quantity, setAmount]);

  const realPrice = poolInfo?.poolPrice
    ? Number(poolInfo.poolPrice) / 10 ** poolDecimals
    : 0;
  const orderValue = quantity && realPrice ? (Number(quantity) * realPrice).toFixed(2) : '';

  // base 입력 → quote 자동 계산, percent 계산
  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = limitDecimals(e.target.value, baseDecimals);
    v = snapToDecimals(Number(v), baseDecimals).toString();
    setBaseValue(v);
    if (side === 'sell' && v) {
      // lot size 내림 적용
      const rawAmount = BigInt(Math.floor(Number(v) * 10 ** baseDecimals));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      const adjusted = (Number(adjustedAmount) / 10 ** baseDecimals).toString();
      if (adjusted !== v) {
        setShowAdjustmentMessage(true);
        v = adjusted;
      } else {
        setShowAdjustmentMessage(false);
      }
      v = snapToDecimals(Number(v), baseDecimals).toString();
      setQuoteValue(
        estimatedPrice ? (Number(v) * estimatedPrice).toFixed(DISPLAY_DECIMALS) : '',
      );
      setPercent(availableBase > 0 ? Math.min((Number(v) / availableBase) * 100, 100) : 0);
    } else {
      setShowAdjustmentMessage(false);
      v = snapToDecimals(Number(v), baseDecimals).toString();
      setBaseValue(v);
      setQuoteValue(
        v && estimatedPrice ? (Number(v) * estimatedPrice).toFixed(DISPLAY_DECIMALS) : '',
      );
      setPercent(availableBase > 0 ? Math.min((Number(v) / availableBase) * 100, 100) : 0);
    }
  };

  // quote 입력 → base 자동 계산, lot size 내림 적용
  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = limitDecimals(e.target.value, quoteDecimals);
    v = snapToDecimals(Number(v), quoteDecimals).toString();
    setQuoteValue(v);
    if (side === 'sell' && v && estimatedPrice) {
      let base = (Number(v) / estimatedPrice).toString();
      // lot size 내림 적용
      const rawAmount = BigInt(Math.floor(Number(base) * 10 ** baseDecimals));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      const adjusted = (Number(adjustedAmount) / 10 ** baseDecimals).toString();
      if (adjusted !== base) {
        setShowAdjustmentMessage(true);
        base = adjusted;
      } else {
        setShowAdjustmentMessage(false);
      }
      base = snapToDecimals(Number(base), baseDecimals).toString();
      setBaseValue(base);
      setQuoteValue(v);
      setPercent(
        availableBase > 0 ? Math.min((Number(base) / availableBase) * 100, 100) : 0,
      );
    } else {
      setShowAdjustmentMessage(false);
      v = snapToDecimals(Number(v), quoteDecimals).toString();
      setQuoteValue(v);
      setBaseValue(
        v && estimatedPrice
          ? snapToDecimals(Number(v) / estimatedPrice, baseDecimals).toString()
          : '',
      );
      setPercent(
        availableBase > 0 && estimatedPrice > 0
          ? Math.min((Number(v) / estimatedPrice / availableBase) * 100, 100)
          : 0,
      );
    }
  };

  // 슬라이더 → base/quote 자동 계산, lot size 내림 적용
  const handleSliderChange = (p: number) => {
    setPercent(p);
    let base = availableBase * (p / 100);
    if (side === 'sell') {
      const rawAmount = BigInt(Math.floor(base * 10 ** baseDecimals));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      base = Number(adjustedAmount) / 10 ** baseDecimals;
    }
    setBaseValue(base ? base.toFixed(DISPLAY_DECIMALS) : '');
    setQuoteValue(estimatedPrice ? (base * estimatedPrice).toFixed(DISPLAY_DECIMALS) : '');
  };

  const scale = Math.pow(10, poolDecimals);
  const intAmount = Math.floor(Number(amount) * scale);
  const intLotSize = Math.floor(tickSize * scale);
  const adjustedInt = adjustToLotSize(intAmount.toString(), intLotSize.toString(), 'down');
  const adjusted = Number(adjustedInt) / scale;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
        <span>Available {side === 'buy' ? tokenIn : tokenIn}</span>
        <span className="text-white font-medium">
          {formatBalance(availableBalance, decimals)} {side === 'buy' ? tokenIn : tokenIn}
        </span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          min="0"
          step={tickSize}
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800"
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
          placeholder={`${side === 'buy' ? tokenOut : tokenIn} Quantity`}
        />
      </div>
      {quantity && realPrice && (
        <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
          <span>Order Value</span>
          <span className="text-white font-medium">
            {Number(orderValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            {side === 'buy' ? tokenIn : tokenOut}
          </span>
        </div>
      )}
      {/* <TradeSlider
        value={percent}
        onChange={handleSliderChange}
        amount={amount}
        price={price}
      /> */}
    </form>
  );
}
