import React from 'react';

import { OrderType } from '@/app/features/trade/useTradeOperations';

interface TradeTabsProps {
  activeOrderType: OrderType;
  setOrderType: (type: OrderType) => void;
}

export default function TradeTabs({ activeOrderType, setOrderType }: TradeTabsProps) {
  return (
    <div className="flex items-center gap-4 mb-3 text-[11px] font-medium">
      <button
        className={`pb-0.5 focus:outline-none ${activeOrderType === 'market' ? 'text-white border-b-2 border-gray-700' : 'text-gray-400 hover:text-white'}`}
        onClick={() => setOrderType('market')}
      >
        Market
      </button>
      <button
        className={`pb-0.5 focus:outline-none ${activeOrderType === 'limit' ? 'text-white border-b-2 border-gray-700' : 'text-gray-400 hover:text-white'}`}
        onClick={() => setOrderType('limit')}
      >
        Limit
      </button>
    </div>
  );
}
