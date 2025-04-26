import React from 'react';

type TradeSliderProps = {
  percent: number;
  setPercent: (v: number) => void;
};

export default function TradeSlider({ percent, setPercent }: TradeSliderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="w-full accent-teal-500"
        style={{ borderRadius: 0 }}
      />
      <input
        type="number"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="w-10 bg-[#23232A] text-[11px] text-white px-1 py-1 border border-gray-800 focus:border-teal-500 outline-none text-center"
        style={{ borderRadius: 0 }}
      />
      <span className="text-[11px] text-gray-400">%</span>
    </div>
  );
}
