import React from 'react';

export default function TradeSection() {
  return (
    <div className="bg-[#23232A] border border-gray-900 flex-1 flex flex-col overflow-hidden min-w-0">
      <div className="flex items-center px-4 py-2 border-b border-gray-800 text-xs bg-[#202027] min-h-[38px]">
        <span className="text-white font-semibold mr-4 cursor-pointer border-b-2 border-teal-400 pb-1">
          Market
        </span>
        <span className="text-gray-400 cursor-pointer">Limit</span>
        <span className="text-gray-400 ml-auto cursor-pointer">Pro</span>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex gap-2 mb-1">
          <button className="flex-1 bg-[#18181B] text-xs text-white py-1 rounded font-semibold">
            Buy
          </button>
          <button className="flex-1 bg-[#18181B] text-xs text-gray-400 py-1 rounded font-semibold">
            Sell
          </button>
        </div>
        <div className="text-xs text-gray-400 mb-1">
          Available to Trade: <span className="text-white">0.00 USDC</span>
        </div>
        <div className="flex gap-2 mb-1">
          <input
            className="flex-1 bg-gray-800 text-xs text-white px-2 py-1 rounded border border-gray-700"
            placeholder="Price (USD)"
          />
          <input
            className="flex-1 bg-gray-800 text-xs text-white px-2 py-1 rounded border border-gray-700"
            placeholder="Size"
          />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400">47 %</span>
          <input type="range" className="w-full" />
        </div>
        <div className="flex gap-2 mb-1">
          <button className="flex-1 bg-teal-500 text-xs text-white py-1 rounded font-semibold">
            Enable Trading
          </button>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 mb-1">
          <span>
            Order Value: <span className="text-white">N/A</span>
          </span>
          <span>
            Fees: <span className="text-white">0.0350% / 0.0100%</span>
          </span>
        </div>
        <div className="flex gap-2 mt-1">
          <button className="flex-1 bg-[#18181B] text-xs text-white py-1 rounded font-semibold">
            Deposit
          </button>
          <button className="flex-1 bg-[#18181B] text-xs text-white py-1 rounded font-semibold">
            Perps ↔ Spot Transfer
          </button>
          <button className="flex-1 bg-[#18181B] text-xs text-white py-1 rounded font-semibold">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
