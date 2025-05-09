import React from 'react';

export default function TradeInfo() {
  return (
    <div
      className="bg-[#23232A] mt-2 p-2 flex flex-col gap-1 text-[11px] text-gray-400 shadow-inner"
      style={{ borderRadius: 0 }}
    >
      <div className="flex justify-between">
        <span>Order Value</span>
        <span className="text-white">N/A</span>
      </div>
      <div className="flex justify-between">
        <span>
          <a href="#" className="underline hover:text-teal-400">
            Slippage
          </a>
          <span className="ml-1 text-teal-400">Est: 0% / Max: 8.00%</span>
        </span>
      </div>
      <div className="flex justify-between">
        <span>Fees</span>
        <span className="text-white">0.0350% / 0.0100%</span>
      </div>
    </div>
  );
}
