import React, { useEffect, useState } from 'react';

interface Trade {
  price: number;
  size: number;
  time: string;
}

// 더미 트레이드 데이터 생성 함수
function getRandomTrades(count = 20): Trade[] {
  const trades: Trade[] = [];
  for (let i = 0; i < count; i++) {
    const price = +(17.77 + Math.random() * 0.01 * (Math.random() > 0.5 ? 1 : -1)).toFixed(
      3,
    );
    const size = +(Math.random() * 100 + 0.5).toFixed(2);
    const now = new Date();
    now.setSeconds(now.getSeconds() - i * 2);
    const time = `${now.getHours()}시 ${now.getMinutes()}분 ${now.getSeconds()}초`;
    trades.push({ price, size, time });
  }
  return trades;
}

export default function TradesTable() {
  const [trades, setTrades] = useState<Trade[]>(getRandomTrades(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setTrades(getRandomTrades(20));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#18181C] border border-gray-800 px-2 py-2 w-full h-full flex-1 mx-auto rounded-none flex flex-col justify-start min-h-[260px]">
      {/* 테이블 헤더 */}
      <div className="flex text-xs text-gray-400 w-full mb-1" style={{ minWidth: 260 }}>
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-right">Size (HYPE)</div>
        <div className="w-1/3 text-right">Time</div>
      </div>
      {/* 트레이드 데이터 */}
      <div className="flex flex-col w-full gap-[1px] overflow-y-auto flex-1">
        {trades.map((trade, i) => (
          <div
            key={i}
            className={`flex text-sm h-5 items-center w-full ${trade.price >= 17.78 ? 'text-green-400' : 'text-red-400'}`}
          >
            <div className="w-1/3">{trade.price.toFixed(3)}</div>
            <div className="w-1/3 text-right">{trade.size}</div>
            <div className="w-1/3 text-right">{trade.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
