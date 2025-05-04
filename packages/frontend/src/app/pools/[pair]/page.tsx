import { notFound } from 'next/navigation';
import React from 'react';

import PoolDetailClient from './components/PoolDetailClient';

interface PageProps {
  params: {
    pair: string;
  };
  searchParams: {
    baseId?: string;
    quoteId?: string;
  };
}

// This is a server component
export default async function PoolDetailPage(props: PageProps) {
  const { params, searchParams } = props;

  const pairString = decodeURIComponent(params?.pair ?? '');
  const baseIdRaw = searchParams?.baseId ?? '';
  const quoteIdRaw = searchParams?.quoteId ?? '';

  const baseAssetId = parseInt(baseIdRaw, 10);
  const quoteAssetId = parseInt(quoteIdRaw, 10);

  if (isNaN(baseAssetId) || isNaN(quoteAssetId)) {
    console.error('Missing or invalid asset IDs in URL params');
    notFound();
  }

  console.log('Pool detail params:', {
    pair: pairString,
    baseAssetId,
    quoteAssetId,
  });

  return (
    <PoolDetailClient
      pair={pairString}
      baseAssetId={baseAssetId}
      quoteAssetId={quoteAssetId}
    />
  );
}
