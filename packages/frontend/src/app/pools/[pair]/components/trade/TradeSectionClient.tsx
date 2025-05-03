'use client';

import dynamic from 'next/dynamic';

const TradeSection = dynamic(() => import('@/app/pools/[pair]/components/trade'), {
  ssr: false,
});

export default function TradeSectionClient(props: any) {
  return <TradeSection {...props} />;
}
