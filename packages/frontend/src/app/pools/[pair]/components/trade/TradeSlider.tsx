import React, { useEffect, useState } from 'react';

interface TradeSliderProps {
  value: number | 'custom'; // 0, 25, 50, 75, 100, or 'custom'
  onChange: (value: number) => void;
  amount: string;
  price: string;
}

const marks = [0, 25, 50, 75, 100];

export default function TradeSlider({ value, onChange, amount, price }: TradeSliderProps) {
  const [orderValue, setOrderValue] = useState('');

  useEffect(() => {
    if (amount && price) {
      setOrderValue((Number(amount) * Number(price)).toString());
    } else {
      setOrderValue('');
    }
  }, [amount, price]);

  const snappedValue =
    typeof value === 'number'
      ? marks.reduce((prev, curr) =>
          Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
        )
      : value;

  // 드래그 시: snap to nearest mark
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    const nearest = marks.reduce((prev, curr) =>
      Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev,
    );
    onChange(nearest);
  };

  // dot 클릭 시: 정확히 해당 값으로 이동
  const handleDotClick = (mark: number) => {
    onChange(mark);
  };

  return (
    <div className="relative w-full" style={{ height: 44 }}>
      {/* Track (배경) */}
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700 rounded-full -translate-y-1/2 z-0" />
      {/* Track (프로그레스) */}
      <div
        className="absolute left-0 top-1/2 h-0.5 bg-teal-400 rounded-full -translate-y-1/2 z-0 transition-all duration-200"
        style={{
          width: snappedValue === 'custom' ? '0%' : `${snappedValue}%`,
          pointerEvents: 'none',
        }}
      />
      {/* Dots + % 라벨 */}
      <div className="absolute left-0 right-0 top-1/2 flex justify-between z-10 px-1">
        {marks.map((mark) => (
          <div key={mark} className="flex flex-col items-center" style={{ width: 0 }}>
            <button
              type="button"
              onClick={() => handleDotClick(mark)}
              className={`w-3 h-3 flex items-center justify-center rounded-full border-2 transition-all duration-150
                ${
                  value === mark
                    ? 'bg-teal-400 border-teal-400 shadow scale-110'
                    : 'bg-gray-700 border-gray-500 hover:border-teal-400'
                }
              `}
              style={{ transform: 'translateY(-50%)', cursor: 'pointer' }}
              tabIndex={0}
              aria-label={`${mark}%`}
            />
            <span
              className={`mt-1 text-xs ${
                value === mark
                  ? 'text-teal-400 font-bold'
                  : mark === 0 || mark === 100
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}
              style={{ minWidth: 28, textAlign: 'center' }}
            >
              {mark === 0 || mark === 100 ? `${mark}%` : value === mark ? `${mark}%` : ''}
            </span>
          </div>
        ))}
        {/* Custom 상태 표시 */}
        {value === 'custom' && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-6 text-teal-400 font-bold">
            Custom
          </div>
        )}
      </div>
      {/* range input (custom일 때는 0, disabled) */}
      <input
        type="range"
        min={0}
        max={100}
        value={value === 'custom' ? 0 : value}
        onChange={handleRangeChange}
        step={1}
        className="absolute w-full h-8 z-20"
        style={{ top: 0, left: 0, opacity: 0.01, pointerEvents: 'all' }}
        tabIndex={0}
        aria-label="slider"
        disabled={value === 'custom'}
      />
    </div>
  );
}
