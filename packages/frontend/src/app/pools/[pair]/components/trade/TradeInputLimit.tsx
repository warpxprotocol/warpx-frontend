import React, { useEffect, useState } from 'react';

import { TradeInputProps } from '@/app/pools/[pair]/components/trade/TradeInput';
import TradeSlider from '@/app/pools/[pair]/components/trade/TradeSlider';

const DISPLAY_DECIMALS = 2;

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

export default function TradeInputLimit({
  side,
  tokenIn,
  tokenOut,
  availableBalance,
  decimals = 6,
  poolInfo,
  price,
  setPrice,
  amount,
  setAmount,
}: TradeInputProps) {
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;

  const poolDecimals = poolInfo?.poolDecimals ?? 2;
  const realPoolPrice = poolInfo?.poolPrice
    ? Number(poolInfo.poolPrice) / 10 ** poolDecimals
    : 0;

  // 상태
  const [orderValue, setOrderValue] = useState('');

  // 첫 렌더링 시 poolPrice로 price 세팅
  useEffect(() => {
    if (realPoolPrice && !price) {
      setPrice(realPoolPrice.toString());
    }
  }, [realPoolPrice, price, setPrice]);

  // price 입력 핸들러
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPrice(value);
    if (amount) {
      setOrderValue((Number(value) * Number(amount)).toString());
    }
  };

  // quantity 입력 핸들러
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    if (price) {
      setOrderValue((Number(price) * Number(value)).toString());
    }
  };

  // orderValue(quote) 입력 핸들러
  const handleOrderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setOrderValue(value);
    if (price && Number(price) !== 0) {
      setAmount((Number(value) / Number(price)).toString());
    }
  };

  // 가격 차이 안내
  let priceDiffMsg = '';
  if (price && poolInfo?.poolPrice) {
    const diff = ((Number(price) - realPoolPrice) / realPoolPrice) * 100;
    if (diff > 0) priceDiffMsg = `현재가보다 +${diff.toFixed(2)}% 높음`;
    else if (diff < 0) priceDiffMsg = `현재가보다 ${diff.toFixed(2)}% 낮음`;
    else priceDiffMsg = '현재가와 동일';
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
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 h-8 border border-gray-800 focus:border-teal-500 outline-none transition"
          value={amount}
          onChange={handleQuantityChange}
          placeholder="Quantity"
        />
        <span className="text-gray-400 text-[11px]">{baseToken}</span>
      </div>
      {/* Order Value 입력 */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 h-8 border border-gray-800 focus:border-teal-500 outline-none transition"
          value={orderValue}
          onChange={handleOrderValueChange}
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
      <TradeSlider value={percent} onChange={handleSliderChange} />
    </form>
  );
}
