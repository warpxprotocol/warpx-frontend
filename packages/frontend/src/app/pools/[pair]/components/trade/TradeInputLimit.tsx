import React, { useEffect, useState } from 'react';

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

// 소수점 자리수 제한 함수
function limitDecimals(value: string, decimals: number) {
  if (!value.includes('.')) return value;
  const [int, frac] = value.split('.');
  return frac.length > decimals ? `${int}.${frac.slice(0, decimals)}` : value;
}

// lotsize 단위로 스냅하는 함수
function snapToLotSize(value: number, lotSize: number) {
  return Math.round(value / lotSize) * lotSize;
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

  const poolDecimals = poolMetadata?.poolDecimals ?? 2;
  const realPoolPrice = poolInfo?.poolPrice
    ? Number(poolInfo.poolPrice) / 10 ** poolDecimals
    : 0;

  const tickSize = poolMetadata?.tickSize ?? 0.01;

  // 상태
  const [orderValue, setOrderValue] = useState('');
  const [isOrderValueInput, setIsOrderValueInput] = useState(false);

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

  // 첫 렌더링 시 poolPrice로 price 세팅
  useEffect(() => {
    if (realPoolPrice && !price) {
      setPrice(realPoolPrice.toString());
    }
  }, [realPoolPrice, price, setPrice]);

  // base/quote decimals 가져오기
  const baseDecimals = Math.min(poolMetadata?.baseDecimals ?? decimals, 2);
  const quoteDecimals = Math.min(poolMetadata?.quoteDecimals ?? decimals, 2);

  // price 입력 핸들러
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    // tickSize의 배수로 반올림
    if (value) {
      value = (Math.round(Number(value) / tickSize) * tickSize).toFixed(poolDecimals);
    }
    setPrice(value);
    if (amount) {
      setOrderValue((Number(value) * Number(amount)).toString());
    }
  };

  // quantity 입력 핸들러 (base asset 기준)
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // onBlur에서만 lotsize/tickSize 스냅 및 소수점 자리수 제한
  const handleQuantityBlur = () => {
    let value = amount;
    if (value === '' || value === '.') {
      setAmount('');
      return;
    }
    let num = Number(value);
    if (isNaN(num)) {
      setAmount('');
      return;
    }
    num = snapToLotSize(num, tickSize);
    const fixed = num.toFixed(baseDecimals);
    setAmount(fixed);

    if (price) {
      let orderValueRaw = num * Number(price);
      orderValueRaw = snapToLotSize(orderValueRaw, tickSize);
      setOrderValue(orderValueRaw ? orderValueRaw.toFixed(quoteDecimals) : '');
    }
  };

  // orderValue 입력 핸들러 (quote asset 기준)
  const handleOrderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOrderValueInput(true);
    setOrderValue(e.target.value);
  };

  const handleOrderValueBlur = () => {
    setIsOrderValueInput(false);
    let value = orderValue;
    if (value === '' || value === '.') {
      setOrderValue('');
      return;
    }
    let num = Number(value);
    if (isNaN(num)) {
      setOrderValue('');
      return;
    }
    num = snapToLotSize(num, tickSize);
    const fixed = num.toFixed(quoteDecimals);
    setOrderValue(fixed);

    if (price && Number(price) !== 0) {
      let baseAmountRaw = num / Number(price);
      baseAmountRaw = snapToLotSize(baseAmountRaw, tickSize);
      setAmount(baseAmountRaw ? baseAmountRaw.toFixed(baseDecimals) : '');
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
          {formatBalance(availableBalance, decimals)} {baseToken}
        </span>
      </div>
      {/* Price 입력 */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={tickSize}
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 h-8 border border-gray-800 focus:border-teal-500 outline-none transition"
          value={price}
          onChange={handlePriceChange}
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
          step={1 / 10 ** poolDecimals}
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
          step={1 / 10 ** poolDecimals}
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
      <TradeSlider
        value={percent}
        onChange={handleSliderChange}
        amount={amount}
        price={price}
      />
    </form>
  );
}
