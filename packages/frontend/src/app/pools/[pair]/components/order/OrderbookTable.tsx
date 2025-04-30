import React, { useEffect, useState } from 'react';

import AMMInfoBox from '../../AMMInfoBox';

// 오더북 데이터 타입
interface Order {
  price: number;
  amount: number;
  total: number;
}

function getRandomOrders(type: 'ask' | 'bid', count = 10): Order[] {
  let base = type === 'ask' ? 4.08 : 4.07;
  let sign = type === 'ask' ? 1 : -1;
  let orders: Order[] = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const price = +(base + sign * i * 0.01).toFixed(2);
    const amount = Math.floor(Math.random() * 100 + 50);
    total += amount;
    orders.push({ price, amount, total });
  }
  return orders;
}

export default function OrderbookTable() {
  const [mounted, setMounted] = useState(false);
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);

  useEffect(() => {
    setMounted(true);
    // Initial data
    setAsks(getRandomOrders('ask', 10));
    setBids(getRandomOrders('bid', 10));

    const interval = setInterval(() => {
      setAsks(getRandomOrders('ask', 10));
      setBids(getRandomOrders('bid', 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 최대 total 값 계산 (각각)
  const maxAskTotal = Math.max(...asks.map((a) => a.total), 1);
  const maxBidTotal = Math.max(...bids.map((b) => b.total), 1);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-[#18181C] border border-gray-800 px-2 py-2 w-full h-full max-w-md mx-auto rounded-none flex flex-col justify-start min-h-[260px]">
      {/* 테이블 헤더 */}
      <div className="flex text-xs text-gray-400 w-full mb-1" style={{ minWidth: 260 }}>
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-right">Amount</div>
        <div className="w-1/3 text-right">Total</div>
      </div>
      {/* 매도(ASKS) - 위쪽 */}
      <div className="flex flex-col w-full gap-[1px]">
        {asks.map((ask, i) => (
          <div
            key={i}
            className="relative flex text-sm text-red-400 h-5 items-center w-full"
          >
            {/* 색상 바 */}
            <div
              className="absolute left-0 top-0 h-full bg-red-500 opacity-20"
              style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
            />
            <div className="w-1/3 relative z-10">{ask.price.toFixed(2)}</div>
            <div className="w-1/3 text-right relative z-10">{ask.amount}</div>
            <div className="w-1/3 text-right relative z-10">{ask.total}</div>
          </div>
        ))}
      </div>
      {/* AMMInfoBox 중앙 배치 - 테이블 컬럼에 맞춰 한 줄로 */}
      <div className="flex w-full my-1">
        <AMMInfoBox />
      </div>
      {/* 매수(BIDS) - 아래쪽 */}
      <div className="flex flex-col w-full gap-[1px]">
        {bids.map((bid, i) => (
          <div
            key={i}
            className="relative flex text-sm text-green-400 h-5 items-center w-full"
          >
            {/* 색상 바 */}
            <div
              className="absolute left-0 top-0 h-full bg-green-500 opacity-20 "
              style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
            />
            <div className="w-1/3 relative z-10">{bid.price.toFixed(2)}</div>
            <div className="w-1/3 text-right relative z-10">{bid.amount}</div>
            <div className="w-1/3 text-right relative z-10">{bid.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
