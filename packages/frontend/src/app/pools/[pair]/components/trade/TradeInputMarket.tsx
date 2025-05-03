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
  availableBalance,
  baseAssetBalance,
  quoteAssetBalance,
  decimals,
  poolInfo,
}: TradeInputProps & { baseAssetBalance: string; quoteAssetBalance: string }) {
  // 자산 구분
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;
  const availableToken = side === 'buy' ? quoteToken : baseToken;

  const { api } = useApi();

  // lotSize, step 등은 항상 base asset 기준
  const [lotSize, setLotSize] = useState<number>(1);
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

  useEffect(() => {
    async function fetchLotSize() {
      if (!poolInfo?.baseAssetId || !poolInfo?.quoteAssetId || !api) return;
      try {
        const base = { WithId: poolInfo.baseAssetId };
        const quote = { WithId: poolInfo.quoteAssetId };
        const poolOpt = await api.query.hybridOrderbook.pools([base, quote]);
        const poolJson =
          typeof poolOpt?.toJSON === 'function' ? poolOpt.toJSON() : undefined;
        if (
          poolJson &&
          typeof poolJson === 'object' &&
          'lotSize' in poolJson &&
          poolJson.lotSize
        ) {
          setLotSize(Number(poolJson.lotSize));
        }
      } catch (e) {
        setLotSize(1); // fallback
      }
    }
    fetchLotSize();
  }, [poolInfo?.baseAssetId, poolInfo?.quoteAssetId, api]);

  // 예상 체결 가격 계산
  const estimatedPrice = poolInfo?.poolPrice ? Number(poolInfo.poolPrice) : 0;
  // You will receive 계산
  const youReceiveAmount =
    side === 'buy' ? Number(amount) / estimatedPrice : Number(amount) * estimatedPrice;

  // lotSize, step 등은 base 기준
  const humanLotSize = formatLotSize(lotSize, decimals ?? 6);
  const fractionDigits = getFractionDigits(lotSize, decimals ?? 6);
  const step = (lotSize / 10 ** (decimals ?? 6)).toFixed(fractionDigits);

  // input에서 직접 입력 시
  const handleInputChange = (value: string) => {
    if (!value) {
      setAmount('');
      setShowAdjustmentMessage(false);
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      setAmount('');
      setShowAdjustmentMessage(false);
      return;
    }
    // Sell: lotSize 내림 적용, Buy: 그대로
    if (side === 'sell') {
      const rawAmount = BigInt(Math.floor(num * 10 ** (decimals ?? 6)));
      const adjustedAmount = adjustToLotSize(rawAmount.toString(), lotSize);
      if (adjustedAmount !== rawAmount.toString()) {
        setShowAdjustmentMessage(true);
      } else {
        setShowAdjustmentMessage(false);
      }
      setAmount((Number(adjustedAmount) / 10 ** (decimals ?? 6)).toString());
    } else {
      setAmount(value);
      setShowAdjustmentMessage(false);
    }
  };

  return (
    <>
      <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
        <span>Available {availableToken}</span>
        <span className="text-white font-medium">
          {formatBalance(availableBalance, decimals)} {availableToken}
        </span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 flex items-center"
          value={amount}
          onChange={(e) => handleInputChange(e.target.value)}
          min={0}
          step={step}
          placeholder={`Enter ${side === 'buy' ? quoteToken : baseToken} amount to ${side}`}
        />
        <div
          className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 flex items-center justify-center"
          style={{ minWidth: '70px' }}
        >
          {side === 'buy' ? quoteToken : baseToken}
        </div>
      </div>

      <div className="text-[11px] text-gray-400 mb-2">
        <span>
          Minimum unit: {humanLotSize} {baseToken}
        </span>
      </div>

      {showAdjustmentMessage && (
        <div className="text-[11px] text-yellow-400 mb-2">
          <span>
            Amount adjusted to match lot size ({humanLotSize} {baseToken})
          </span>
        </div>
      )}
      <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
        <span>Max {side === 'buy' ? 'Buying Power' : 'Selling Amount'}</span>
        <span className="text-white font-medium">
          {formatDisplayAmount(maxAmount)} {availableToken}
        </span>
      </div>
      {/* 예상 수령액 표시 */}
      {amount && estimatedPrice > 0 && (
        <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
          <span>You will receive</span>
          <span className="text-white font-medium">
            {formatDisplayAmount(youReceiveAmount?.toString() ?? '')}{' '}
            {side === 'buy' ? baseToken : quoteToken}
          </span>
        </div>
      )}
    </>
  );
}
