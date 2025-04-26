'use client';

import React, { useState } from 'react';

import EnableTradingButton from './EnableTradingButton';
import SideToggle from './SideToggle';
import TradeInfo from './TradeInfo';
import TradeInput from './TradeInput';
import TradeSlider from './TradeSlider';
import TradeTabs from './TradeTabs';

export default function TradeSection() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [percent, setPercent] = useState(47);

  return (
    <div
      className="bg-[#202027] flex flex-col min-w-0 h-full shadow-md p-3 max-w-[340px] mx-auto overflow-hidden"
      style={{ height: '100%' }}
    >
      <div className="flex flex-col gap-2 flex-1">
        <TradeTabs />
        <SideToggle side={side} setSide={setSide} />
        <TradeInput />
        <TradeSlider percent={percent} setPercent={setPercent} />
        <TradeInfo />
      </div>
      <div className="mt-2">
        <EnableTradingButton />
      </div>
    </div>
  );
}
