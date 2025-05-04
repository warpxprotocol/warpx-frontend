import React, { useEffect, useMemo, useState } from 'react';

import { TradeInputProps } from '@/app/pools/[pair]/components/trade/TradeInput';
import { useApi } from '@/hooks/useApi';

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
  if (isNaN(parsed)) return { ok: false, reason: '수량 입력이 올바르지 않습니다.' };

  const rawAmount = BigInt(Math.floor(parsed * 10 ** decimals));
  if (rawAmount < BigInt(minUnit))
    return { ok: false, reason: `최소 주문 단위는 ${minUnit / 10 ** decimals} 입니다.` };

  const balance = BigInt(availableBalance);
  const fee = BigInt(estimatedFee);
  const ed = BigInt(existentialDeposit);

  // 잔고 - 주문금액 - 수수료 ≥ ED
  if (balance - rawAmount - fee < ed)
    return {
      ok: false,
      reason: '잔고에서 최소 잔고(Existential Deposit)와 수수료를 뺀 값이 부족합니다.',
    };
  if (rawAmount > balance) return { ok: false, reason: '잔고가 부족합니다.' };

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
  poolInfo,
}: TradeInputProps & {
  baseAssetBalance: string;
  quoteAssetBalance: string;
  setPrice?: (v: string) => void;
}) {
  // 자산 구분
  const lotSize = 10_000_000; // 0.01 DOT 단위
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;
  const availableToken = side === 'buy' ? quoteToken : baseToken;

  const { api } = useApi();

  // lotSize, step 등은 항상 base asset 기준
  const [showAdjustmentMessage, setShowAdjustmentMessage] = useState(false);

  // Max Amount: Buy는 quote, Sell은 base 기준
  const maxAmount = useMemo(() => {
    if (!availableBalance || !lotSize) return '0';
    if (side === 'buy') {
      // Buy: quote 잔고(availableBalance) 그대로
      return (Number(availableBalance) / 10 ** (decimals ?? 6)).toString();
    } else {
      // Sell: base 잔고(availableBalance)에서 lotSize 내림 적용
      const rawAmount = BigInt(availableBalance);
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      return (Number(adjustedAmount) / 10 ** (decimals ?? 6)).toString();
    }
  }, [availableBalance, lotSize, decimals, side]);

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

  // base 입력 → quote 자동 계산, percent 계산
  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (side === 'sell' && v) {
      // lot size 내림 적용
      const rawAmount = BigInt(Math.floor(Number(v) * 10 ** (decimals ?? 6)));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      const adjusted = (Number(adjustedAmount) / 10 ** (decimals ?? 6)).toString();
      if (adjusted !== v) {
        setShowAdjustmentMessage(true);
        v = adjusted;
      } else {
        setShowAdjustmentMessage(false);
      }
      setBaseValue(v);
      setQuoteValue(
        estimatedPrice ? (Number(v) * estimatedPrice).toFixed(DISPLAY_DECIMALS) : '',
      );
      setPercent(availableBase > 0 ? Math.min((Number(v) / availableBase) * 100, 100) : 0);
    } else {
      setShowAdjustmentMessage(false);
      setBaseValue(v);
      setQuoteValue(
        v && estimatedPrice ? (Number(v) * estimatedPrice).toFixed(DISPLAY_DECIMALS) : '',
      );
      setPercent(availableBase > 0 ? Math.min((Number(v) / availableBase) * 100, 100) : 0);
    }
  };

  // quote 입력 → base 자동 계산, lot size 내림 적용
  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (side === 'sell' && v && estimatedPrice) {
      let base = (Number(v) / estimatedPrice).toString();
      // lot size 내림 적용
      const rawAmount = BigInt(Math.floor(Number(base) * 10 ** (decimals ?? 6)));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      const adjusted = (Number(adjustedAmount) / 10 ** (decimals ?? 6)).toString();
      if (adjusted !== base) {
        setShowAdjustmentMessage(true);
        base = adjusted;
      } else {
        setShowAdjustmentMessage(false);
      }
      setBaseValue(base);
      setQuoteValue(v);
      setPercent(
        availableBase > 0 ? Math.min((Number(base) / availableBase) * 100, 100) : 0,
      );
    } else {
      setShowAdjustmentMessage(false);
      setQuoteValue(v);
      setBaseValue(
        v && estimatedPrice
          ? ((Number(v) * 100) / estimatedPrice).toFixed(DISPLAY_DECIMALS)
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
      const rawAmount = BigInt(Math.floor(base * 10 ** (decimals ?? 6)));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
      base = Number(adjustedAmount) / 10 ** (decimals ?? 6);
    }
    setBaseValue(base ? base.toFixed(DISPLAY_DECIMALS) : '');
    setQuoteValue(estimatedPrice ? (base * estimatedPrice).toFixed(DISPLAY_DECIMALS) : '');
  };

  // 입력값이 바뀔 때 부모로 값 올려주기
  useEffect(() => {
    setAmount(baseValue);
    if (setPrice && quoteValue) setPrice(quoteValue);
    // 필요하다면 percent도 부모로 올려줄 수 있음
  }, [baseValue, quoteValue, setAmount, setPrice]);

  // 잔고/side가 바뀌면 입력값 초기화
  useEffect(() => {
    setBaseValue('');
    setQuoteValue('');
    setPercent(0);
  }, [availableBase, side]);

  // amountIn을 extrinsic에 넘기기 전에
  let amountIn = baseValue;
  if (side === 'sell') {
    const rawAmount = BigInt(Math.floor(Number(baseValue) * 10 ** (decimals ?? 6)));
    const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize, 'down');
    amountIn = (Number(adjustedAmount) / 10 ** (decimals ?? 6)).toString();
  }

  const baseDecimals = 9;
  const quantity = BigInt(Math.floor(Number(amount) * 10 ** baseDecimals));
  const adjustedQuantity = (quantity / BigInt(lotSize)) * BigInt(lotSize);

  console.log({
    amount,
    quantity: quantity.toString(),
    adjustedQuantity: adjustedQuantity.toString(),
  });

  const poolDecimals = poolInfo?.poolDecimals ?? 2;
  const realPrice = poolInfo?.poolPrice
    ? Number(poolInfo.poolPrice) / 10 ** poolDecimals
    : 0;
  const orderValue = amount ? Number(amount) * realPrice : 0;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
        <span>Available {side === 'buy' ? tokenIn : tokenOut}</span>
        <span className="text-white font-medium">
          {formatBalance(availableBalance, decimals)} {side === 'buy' ? tokenIn : tokenOut}
        </span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`${side === 'buy' ? tokenOut : tokenIn} 수량`}
        />
      </div>
      {amount && poolInfo?.poolPrice && (
        <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
          <span>Order Value</span>
          <span className="text-white font-medium">
            {orderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            {side === 'buy' ? tokenIn : tokenOut}
          </span>
        </div>
      )}
      <TradeSlider value={percent} onChange={handleSliderChange} />
    </form>
  );
}
