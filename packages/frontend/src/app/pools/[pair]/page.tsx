import React from 'react';

import ChartSection from './ChartSection';
import FundsActionSection from './FundsActionSection';
import OrderTableSection from './OrderTableSection';
import OrderbookSection from './OrderbookSection';
import TradeSection from './TradeSection';

export default async function PoolDetailPage({ params }: { params: { pair: string } }) {
  const awaitedParams = await params;
  return (
    <main className="w-full min-h-screen bg-[#18181B] p-0 grid grid-rows-[76vh_minmax(8vh,auto)] grid-cols-1 xl:grid-cols-[3fr_1fr_1fr] gap-2 xl:gap-4">
      <div className="row-start-1 col-start-1 col-span-1 xl:col-span-1">
        <ChartSection pair={awaitedParams.pair} />
      </div>
      <div className="row-start-1 col-start-2 col-span-1">
        <OrderbookSection />
      </div>
      <div className="row-start-1 col-start-3 col-span-1">
        <TradeSection />
      </div>
      <div className="row-start-2 col-start-1 col-span-2">
        <OrderTableSection />
      </div>
      <div className="row-start-2 col-start-3 col-span-1">
        <FundsActionSection />
      </div>
    </main>
  );
}
