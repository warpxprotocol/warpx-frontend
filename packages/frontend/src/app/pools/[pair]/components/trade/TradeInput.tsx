import React from 'react';

export default function TradeInput() {
  return (
    <>
      <div className="text-[11px] text-gray-400 mb-1 flex justify-between">
        <span>Available</span>
        <span className="text-white font-medium">0.00 USDC</span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none transition"
          style={{ borderRadius: 0 }}
          placeholder="Size"
        />
        <select
          className="bg-[#23232A] text-[11px] text-white px-2 py-1 border border-gray-800 focus:border-teal-500 outline-none"
          style={{ borderRadius: 0 }}
        >
          <option>USDC</option>
        </select>
      </div>
    </>
  );
}
