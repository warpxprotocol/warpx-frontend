import React from 'react';

export default function TradeTabs() {
  return (
    <div className="flex items-center gap-4 mb-3 text-[11px] font-medium">
      <button className="text-white border-b-2 border-teal-400 pb-0.5 focus:outline-none">
        Market
      </button>
      <button className="text-gray-400 hover:text-white pb-0.5 focus:outline-none">
        Limit
      </button>
      <span className="ml-auto text-gray-400 hover:text-white cursor-pointer">Pro</span>
    </div>
  );
}
