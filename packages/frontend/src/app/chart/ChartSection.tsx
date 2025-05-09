import React from 'react';

import TradingViewWidget from './TradingViewWidget';

export default function ChartSection({
  pair,
  baseAssetId,
  quoteAssetId,
}: {
  pair: string;
  baseAssetId?: number;
  quoteAssetId?: number;
}) {
  const decodedPair = decodeURIComponent(pair);
  return (
    <section className="bg-[#23232A] h-full flex flex-col border border-gray-900 overflow-hidden">
      <TradingViewWidget />
    </section>
  );
}
