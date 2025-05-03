import React, { useState } from 'react';

import { TradeInputProps } from '@/app/pools/[pair]/components/trade/TradeInput';

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
  amount,
  setAmount,
  price,
  setPrice,
  availableBalance,
  decimals = 6,
  poolInfo,
}: TradeInputProps) {
  const baseToken = side === 'buy' ? tokenOut : tokenIn;
  const quoteToken = side === 'buy' ? tokenIn : tokenOut;
  const available = Number(availableBalance) / 10 ** decimals;
  const [percent, setPercent] = useState(0);

  // 슬라이더 → input 연동
  const handleSliderChange = (v: number) => {
    setPercent(v);
    const value = (available * (v / 100)).toFixed(DISPLAY_DECIMALS);
    setAmount(value);
  };

  // input → 슬라이더 연동
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const [int, dec] = value.split('.');
    if (dec && dec.length > DISPLAY_DECIMALS) {
      value = `${int}.${dec.slice(0, DISPLAY_DECIMALS)}`;
    }
    setAmount(value);
    const num = parseFloat(value);
    setPercent(available > 0 && num ? Math.min((num / available) * 100, 100) : 0);
  };

  // 가격 입력 핸들러
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const [int, dec] = value.split('.');
    if (dec && dec.length > 4) {
      value = `${int}.${dec.slice(0, 4)}`;
    }
    setPrice(value);
  };

  // 예상 체결 금액
  const estimatedValue = amount && price ? Number(amount) * Number(price) : 0;

  return (
    <>
      <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
        <span>Available</span>
        <span className="text-white font-medium">
          {formatBalance(availableBalance, decimals)} {baseToken}
        </span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none transition"
          style={{ borderRadius: 0 }}
          placeholder="Size"
          value={formatDisplayAmount(amount)}
          onChange={handleInputChange}
          type="text"
          inputMode="decimal"
        />
        <div
          className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 flex items-center justify-center"
          style={{ minWidth: '70px' }}
        >
          {baseToken}
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none transition"
          style={{ borderRadius: 0 }}
          placeholder="Price"
          value={price}
          onChange={handlePriceChange}
          type="text"
          inputMode="decimal"
        />
        <div
          className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 flex items-center justify-center"
          style={{ minWidth: '70px' }}
        >
          {quoteToken}
        </div>
      </div>
      {/* 예상 체결 금액 */}
      {amount && price && (
        <div className="text-[11px] text-gray-400 mb-2 flex justify-between">
          <span>Order Value</span>
          <span className="text-white font-medium">
            {estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            {quoteToken}
          </span>
        </div>
      )}
    </>
  );
}
