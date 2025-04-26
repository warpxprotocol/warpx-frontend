import React from 'react';

export default function AMMInfoBox() {
  return (
    <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
      {/* 상단: PRICE / DEPTH */}
      <div className="flex w-full justify-between items-center mb-0.5">
        <span className="text-gray-400 text-xs font-medium tracking-widest">PRICE</span>
        <span className="text-gray-400 text-xs font-medium tracking-widest">DEPTH</span>
      </div>
      {/* 중앙: 가격/USDT, 우측 페어 */}
      <div className="flex w-full items-center justify-between mb-1">
        <div className="flex items-end">
          <span className="text-xl font-semibold text-white leading-none">4.070676</span>
          <span className="ml-1 text-xs text-gray-400 font-medium">USDT</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between">
              <span className="text-white text-base mr-1">🟣</span>
              <span className="text-white font-medium text-xs">2,943.49</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between">
              <span className="text-white text-base mr-1">🟦</span>
              <span className="text-white font-medium text-xs">11,980</span>
            </span>
          </div>
        </div>
      </div>
      {/* 하단: AMM, V2 뱃지 */}
      <div className="flex w-full mt-0 gap-1">
        <span className="bg-[#23232A] text-[10px] text-white font-semibold rounded px-1.5 py-0.5">
          AMM
        </span>
        <span className="bg-gray-600 text-[10px] text-white font-semibold rounded px-1.5 py-0.5">
          V2
        </span>
      </div>
    </div>
  );
}
