import React from 'react';

type SideToggleProps = {
  side: 'buy' | 'sell';
  setSide: (side: 'buy' | 'sell') => void;
};

export default function SideToggle({ side, setSide }: SideToggleProps) {
  return (
    <div className="flex gap-2 mb-3">
      <button
        className={`flex-1 py-1 font-semibold transition-colors text-[11px] ${side === 'buy' ? 'bg-teal-500 text-white shadow' : 'bg-[#23232A] text-gray-400'}`}
        style={{ borderRadius: 0 }}
        onClick={() => setSide('buy')}
      >
        Buy
      </button>
      <button
        className={`flex-1 py-1 font-semibold transition-colors text-[11px] ${side === 'sell' ? 'bg-rose-500 text-white shadow' : 'bg-[#23232A] text-gray-400'}`}
        style={{ borderRadius: 0 }}
        onClick={() => setSide('sell')}
      >
        Sell
      </button>
    </div>
  );
}
