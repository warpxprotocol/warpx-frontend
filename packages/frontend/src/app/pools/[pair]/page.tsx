import React from 'react';

import ChartSection from './ChartSection';
import OrderTableSection from './OrderTableSection';
import OrderbookSection from './OrderbookSection';
import TradeSection from './TradeSection';

export default async function PoolDetailPage({ params }: { params: { pair: string } }) {
  const awaitedParams = await params;
  return (
    <main className="w-full min-h-screen bg-[#18181B] p-0">
      {/* 상단: 차트(3/5) | 오더북+트레이드(2/5, 가로 2분할) */}
      <div
        className="w-full grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-2 xl:gap-4"
        style={{ height: '80vh' }}
      >
        <ChartSection pair={awaitedParams.pair} />
        <section className="h-full flex flex-row gap-2">
          <OrderbookSection />
          <TradeSection />
        </section>
      </div>
      {/* 하단: 오더/포지션/잔고 등 탭만, 컴팩트하게 */}
      <div className="w-full mt-2" style={{ minHeight: '8vh' }}>
        <OrderTableSection />
      </div>
    </main>
  );
}
