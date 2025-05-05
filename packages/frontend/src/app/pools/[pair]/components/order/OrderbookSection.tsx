'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import TradesTable from '../trade/TradesTable';
import OrderbookTable from './OrderbookTable';

// Create a dynamic import of the OrderbookSection component with no SSR
const OrderbookSectionClient = dynamic(() => Promise.resolve(OrderbookSection), {
  ssr: false,
});

function OrderbookSection({
  baseAssetId,
  quoteAssetId,
}: {
  baseAssetId?: number;
  quoteAssetId?: number;
}) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
      <div className="flex-1 flex flex-col min-h-0">
        <OrderbookTable />
      </div>
    </div>
  );
}
export default function OrderbookSectionWrapper({
  baseAssetId,
  quoteAssetId,
}: {
  baseAssetId?: number;
  quoteAssetId?: number;
}) {
  return <OrderbookSectionClient baseAssetId={baseAssetId} quoteAssetId={quoteAssetId} />;
}
