'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ChartSection = dynamic(() => import('../../../chart/ChartSection'), { ssr: false });
const FundsActionSection = dynamic(() => import('../FundsActionSection'), { ssr: false });
const OrderTableSection = dynamic(() => import('./order/OrderTableSection'), {
  ssr: false,
});
const OrderbookSection = dynamic(() => import('./order/OrderbookSection'), { ssr: false });
const TradeSectionClient = dynamic(() => import('./trade/TradeSectionClient'), {
  ssr: false,
});

interface PoolDetailClientProps {
  pair: string;
  baseAssetId: number;
  quoteAssetId: number;
}

export default function PoolDetailClient({
  pair,
  baseAssetId,
  quoteAssetId,
}: PoolDetailClientProps) {
  return (
    <main className="w-full h-full min-h-[calc(100vh-64px)] bg-[#0f0f0f] p-0 grid grid-rows-1 grid-cols-1 xl:grid-cols-[3fr_1fr_1fr] gap-2 xl:gap-4">
      <div className="row-start-1 row-span-2 col-start-1 col-span-1 xl:col-span-1">
        <ChartSection pair={pair} baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div>
      <div className="row-start-1 row-span-2 col-start-2 col-span-1">
        <OrderbookSection baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div>
      <div className="row-start-1 row-span-2 col-start-3 col-span-1">
        <TradeSectionClient baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div>
      {/* <div className="row-start-2 col-start-1 col-span-2">
        <OrderTableSection />
      </div>
      <div className="row-start-2 col-start-3 col-span-1">
        <FundsActionSection baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div> */}
    </main>
  );
}
