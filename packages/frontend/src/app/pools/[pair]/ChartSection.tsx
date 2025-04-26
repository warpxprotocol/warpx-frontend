import React from 'react';

export default function ChartSection({ pair }: { pair: string }) {
  return (
    <section className="bg-[#23232A] h-full flex flex-col border border-gray-900 overflow-hidden">
      {/* 심볼/정보 바 */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-2 border-b border-gray-800 bg-[#202027] text-xs min-h-[38px]">
        <span className="font-bold text-white text-base tracking-tight">
          {pair.replace(/-/g, ' / ')}
        </span>
        <span className="bg-[#18181B] text-green-400 px-2 py-0.5 rounded text-xs">
          Spot
        </span>
        <span className="text-gray-400">
          Price <span className="text-white font-semibold">17.661</span>
        </span>
        <span className="text-gray-400">
          24h Change <span className="text-red-400">-1.129 / -6.01%</span>
        </span>
        <span className="text-gray-400">
          24h Volume <span className="text-white">$56,541,000</span>
        </span>
        <span className="text-gray-400">
          Market Cap <span className="text-white">$5,919,274,230</span>
        </span>
        <span className="text-gray-400">
          Contract <span className="underline">0x0d01...11ec</span>
        </span>
      </div>
      {/* 차트+툴바 */}
      <div className="flex-1 flex flex-col">
        {/* 툴바 */}
        <div className="flex items-center gap-3 px-6 py-1 border-b border-gray-800 text-xs text-gray-400 bg-[#23232A] min-h-[32px]">
          <span className="cursor-pointer hover:text-white">5m</span>
          <span className="cursor-pointer hover:text-white">1h</span>
          <span className="cursor-pointer hover:text-white">D</span>
          <span className="cursor-pointer hover:text-white">W</span>
          <span className="ml-2 cursor-pointer hover:text-white">Indicators</span>
        </div>
        {/* 차트 영역 */}
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="w-full h-full min-h-[300px] flex items-center justify-center text-gray-500 text-xs">
            Trading Chart
          </div>
        </div>
      </div>
    </section>
  );
}
