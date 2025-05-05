import { notFound } from 'next/navigation';
import React from 'react';

import PoolDetailClient from './components/PoolDetailClient';

interface PageProps {
  params: Promise<{
    pair: string;
  }>;
  searchParams: Promise<{
    baseId?: string;
    quoteId?: string;
  }>;
}

export default async function PoolDetailPage(props: PageProps) {
  const { params, searchParams } = props;
  const { pair } = await params;
  const { baseId = '', quoteId = '' } = await searchParams;

  const pairString = decodeURIComponent(pair ?? '');
  const baseAssetId = parseInt(baseId, 10);
  const quoteAssetId = parseInt(quoteId, 10);

  if (isNaN(baseAssetId) || isNaN(quoteAssetId)) {
    console.error('Missing or invalid asset IDs in URL params');
    notFound();
  }

  return (
    <PoolDetailClient
      pair={pairString}
      baseAssetId={baseAssetId}
      quoteAssetId={quoteAssetId}
    />
  );
}
