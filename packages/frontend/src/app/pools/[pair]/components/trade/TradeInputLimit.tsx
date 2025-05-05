import React, { useEffect, useRef, useState } from 'react';

import { TradeInputProps } from '@/app/pools/[pair]/components/trade/TradeInput';
import TradeSlider from '@/app/pools/[pair]/components/trade/TradeSlider';

const DISPLAY_DECIMALS = 2;

function formatBalance(raw: string, decimals: number = 2) {
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

// 소수점 자리수 제한 함수 (문자열 입력에도 대응)
function limitDecimals(value: string, decimals: number) {
  if (!value.includes('.')) return value;
  const [int, frac] = value.split('.');
  return frac.length > decimals ? `${int}.${frac.slice(0, decimals)}` : value;
}

// lotsize 단위로 스냅하는 함수 (반올림), floating point 오차 보정
function snapToDecimals(value: number, decimals: number) {
  return parseFloat(value.toFixed(decimals));
}

export default function TradeInputLimit({
  side,
  tokenIn,
  tokenOut,
  availableBalance,
  decimals = 2,
  poolInfo,
  price,
  setPrice,
  amount,
  setAmount,
  poolMetadata,
}: TradeInputProps) {
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;

  // poolDecimals를 숫자로 변환
  const poolDecimals = Number(poolMetadata?.poolDecimals ?? 2);

  // tickSize를 poolDecimals로부터 직접 계산
  const tickSize = 1 / Math.pow(10, poolDecimals);

  // 콘솔로 확인
  console.log(
    'tickSize(계산):',
    tickSize,
    'poolDecimals:',
    poolDecimals,
    'poolMetadata:',
    poolMetadata,
  );

  const realPoolPrice = poolInfo?.poolPrice
    ? Number(poolInfo.poolPrice) / 10 ** poolDecimals
    : 0;

  // 상태
  const [orderValue, setOrderValue] = useState('');
  const [isOrderValueInput, setIsOrderValueInput] = useState(false);

  // 최초 poolPrice 세팅 여부 추적
  const didInitPrice = useRef(false);

  useEffect(() => {
    if (!didInitPrice.current && realPoolPrice && !price) {
      setPrice(realPoolPrice.toFixed(poolDecimals));
      didInitPrice.current = true;
    }
    // price를 지워도 다시 세팅하지 않음!
  }, [realPoolPrice, price, setPrice, poolDecimals]);

  useEffect(() => {
    if (!isOrderValueInput) {
      if (amount && price) {
        setOrderValue((Number(amount) * Number(price)).toFixed(quoteDecimals));
      } else {
        setOrderValue('');
      }
    }
    // eslint-disable-next-line
  }, [amount, price]);

  // base/quote decimals 가져오기
  const baseDecimals = Math.max(poolMetadata?.baseDecimals ?? decimals, 2);
  const quoteDecimals = Math.max(poolMetadata?.quoteDecimals ?? decimals, 2);

  const baseStep = 1 / Math.pow(10, baseDecimals);
  const quoteStep = 1 / Math.pow(10, quoteDecimals);

  // 입력 핸들러: 입력값만 바꿈
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith('-')) value = value.replace('-', '');
    setPrice(value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith('-')) value = value.replace('-', '');
    value = limitDecimals(value, baseDecimals); // baseDecimals 자리로 제한
    setAmount(value);
  };

  const handleOrderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith('-')) value = value.replace('-', '');
    value = limitDecimals(value, quoteDecimals); // quoteDecimals 자리로 제한
    setOrderValue(value);
  };

  // onBlur에서만 스냅 및 연산
  const handlePriceBlur = () => {
    if (!price || price === '.') {
      setPrice('');
      return;
    }
    let num = Number(price);
    if (isNaN(num) || num < tickSize) {
      num = tickSize;
    } else {
      num = snapToDecimals(num, poolDecimals);
    }
    const snapped = num.toFixed(poolDecimals);
    setPrice(snapped);

    if (amount) {
      setOrderValue((Number(snapped) * Number(amount)).toFixed(quoteDecimals));
    }
  };

  const handleQuantityBlur = () => {
    if (!amount || amount === '.') {
      setAmount(tickSize.toFixed(baseDecimals));
      if (price) {
        setOrderValue((Number(price) * tickSize).toFixed(quoteDecimals));
      }
      return;
    }
    let num = Number(amount);
    if (isNaN(num) || num < tickSize) {
      num = tickSize;
    } else {
      num = snapToDecimals(num, baseDecimals); // baseDecimals 자리로 반올림
    }
    const snapped = num.toFixed(baseDecimals);
    setAmount(snapped);

    // price가 있으면 orderValue 계산
    if (price) {
      setOrderValue((Number(price) * Number(snapped)).toFixed(quoteDecimals));
    }
  };

  const handleOrderValueBlur = () => {
    if (!orderValue || orderValue === '.') {
      setOrderValue('');
      return;
    }
    let num = Number(orderValue);
    if (isNaN(num) || num < tickSize) {
      num = tickSize;
    } else {
      num = snapToDecimals(num, quoteDecimals); // quoteDecimals 자리로 반올림
    }
    const snapped = num.toFixed(quoteDecimals);
    setOrderValue(snapped);

    // price와 orderValue가 있으면 amount 계산
    if (price && Number(price) !== 0) {
      const baseAmountRaw = num / Number(price);
      const baseSnapped = snapToDecimals(baseAmountRaw, baseDecimals); // baseDecimals 자리로 반올림
      setAmount(baseSnapped ? baseSnapped.toFixed(baseDecimals) : '');
    }
  };

  // 가격 차이 안내
  let priceDiffMsg = '';
  if (price && poolInfo?.poolPrice) {
    const diff = ((Number(price) - realPoolPrice) / realPoolPrice) * 100;
    if (diff > 0) priceDiffMsg = `Current price is ${diff.toFixed(2)}% higher`;
    else if (diff < 0) priceDiffMsg = `Current price is ${diff.toFixed(2)}% lower`;
    else priceDiffMsg = 'Current price is the same';
  }

  // 슬라이더 → 수량 입력
  const available = Number(availableBalance) / 10 ** decimals;
  const [percent, setPercent] = useState(0);

  const handleSliderChange = (v: number) => {
    setPercent(v);
    const value = (available * (v / 100)).toFixed(2);
    setAmount(value);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
      {/* 잔고 */}
      <div className="text-[11px] text-gray-400 flex justify-between">
        <span>Available</span>
        <span className="text-white font-medium">
          {formatBalance(availableBalance, decimals)} {tokenIn}
        </span>
      </div>
      {/* Price 입력 */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step={tickSize}
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 h-8 border border-gray-800 focus:border-teal-500 outline-none transition"
          value={price}
          onChange={handlePriceChange}
          onBlur={handlePriceBlur}
          placeholder="Price"
        />
        <span className="text-gray-400 text-[11px]">{quoteToken}</span>
      </div>
      {/* 가격 차이 안내 */}
      {price && poolInfo?.poolPrice && (
        <div className="text-[10px] text-gray-400">{priceDiffMsg}</div>
      )}
      {/* Quantity 입력 */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step={baseStep}
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 h-8 border border-gray-800 focus:border-teal-500 outline-none transition"
          value={amount}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
          placeholder="Quantity"
        />
        <span className="text-gray-400 text-[11px]">{baseToken}</span>
      </div>
      {/* Order Value 입력 */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step={quoteStep}
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 h-8 border border-gray-800 focus:border-teal-500 outline-none transition"
          value={orderValue}
          onChange={handleOrderValueChange}
          onBlur={handleOrderValueBlur}
          placeholder="Order Value"
        />
        <span className="text-gray-400 text-[11px]">{quoteToken}</span>
      </div>
      {/* Order Value 텍스트 */}
      {amount && price && (
        <div className="text-[11px] text-gray-400 flex justify-between">
          <span>Order Value</span>
          <span className="text-white font-medium">
            {Number(orderValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            {quoteToken}
          </span>
        </div>
      )}
      {/* 슬라이더 */}
      {/* <TradeSlider
        value={percent}
        onChange={handleSliderChange}
        amount={amount}
        price={price}
      /> */}
    </form>
  );
}
