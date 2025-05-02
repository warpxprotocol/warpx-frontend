import { notFound } from 'next/navigation';
import React from 'react';

import ChartSection from './ChartSection';
import FundsActionSection from './FundsActionSection';
import OrderTableSection from './components/order/OrderTableSection';
import OrderbookSection from './components/order/OrderbookSection';
import TradeSection from './components/trade';

// This is a server component
export default async function PoolDetailPage({
  params,
  searchParams,
}: {
  params: { pair: string };
  searchParams: { baseId?: string; quoteId?: string };
}) {
  const pairString = decodeURIComponent(params.pair);

  // Extract asset IDs from search params
  const baseAssetId = searchParams.baseId ? parseInt(searchParams.baseId, 10) : undefined;
  const quoteAssetId = searchParams.quoteId
    ? parseInt(searchParams.quoteId, 10)
    : undefined;

  // Log the received parameters
  console.log('Pool detail params:', {
    pair: pairString,
    baseAssetId,
    quoteAssetId,
  });

  // If we don't have asset IDs, show a helpful error
  if (!baseAssetId || !quoteAssetId) {
    console.error('Missing asset IDs in URL params');
    notFound(); // 404 페이지로 이동
  }

  return (
    <main className="w-full min-h-screen bg-[#18181B] p-0 grid grid-rows-[76vh_minmax(8vh,auto)] grid-cols-1 xl:grid-cols-[3fr_1fr_1fr] gap-2 xl:gap-4">
      <div className="row-start-1 col-start-1 col-span-1 xl:col-span-1">
        <ChartSection
          pair={pairString}
          baseAssetId={baseAssetId}
          quoteAssetId={quoteAssetId}
        />
      </div>
      <div className="row-start-1 col-start-2 col-span-1">
        <OrderbookSection baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div>
      <div className="row-start-1 col-start-3 col-span-1">
        <TradeSection baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div>
      <div className="row-start-2 col-start-1 col-span-2">
        <OrderTableSection />
      </div>
      <div className="row-start-2 col-start-3 col-span-1">
        <FundsActionSection baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />
      </div>
    </main>
  );
}
