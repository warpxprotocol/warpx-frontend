'use client';

import React, { useState } from 'react';

import TradesTable from '../trade/TradesTable';
import OrderbookTable from './OrderbookTable';

export default function OrderbookSection() {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');

  return (
    <div className="bg-[#23232A] border border-gray-900 flex-1 flex flex-col overflow-hidden min-w-0 h-full">
      <div className="flex items-center px-4 py-2 border-b border-gray-800 text-xs bg-[#202027] min-h-[38px]">
        <span
          className={`mr-4 cursor-pointer pb-1 font-semibold ${
            activeTab === 'orderbook'
              ? 'text-white border-b-2 border-teal-400'
              : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('orderbook')}
        >
          Order Book
        </span>
        <span
          className={`cursor-pointer pb-1 ${
            activeTab === 'trades'
              ? 'text-white border-b-2 border-teal-400'
              : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('trades')}
        >
          Trades
        </span>
      </div>
      <div className="flex-1 flex flex-col bg-gray-900 text-xs text-gray-500">
        {activeTab === 'orderbook' ? <OrderbookTable /> : <TradesTable />}
      </div>
    </div>
  );
}
