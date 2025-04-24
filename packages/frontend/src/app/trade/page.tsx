'use client';

import { ApiPromise } from '@polkadot/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useApi } from '@/hooks/useApi';
import {
  fetchAssets,
  fetchRecentBlocks,
  subscribeToAssetTransfers,
} from '@/services/features/assets/quries';
import type { AssetInfo, BlockInfo } from '@/services/features/assets/types';

interface TransferEvent {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
}

export default function TradePage() {
  const { api } = useApi();
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);

  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(api as ApiPromise),
    enabled: !!api,
    refetchInterval: 10000, // 10초마다 새로고침
  });

  // 최근 블록 정보 조회
  const { data: recentBlocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ['recentBlocks'],
    queryFn: () => fetchRecentBlocks(api as ApiPromise),
    enabled: !!api,
    refetchInterval: 10000,
  });

  // 이벤트 구독
  useEffect(() => {
    if (!api) return;

    const unsubscribe = subscribeToAssetTransfers(api as ApiPromise, (from, to, amount) => {
      setTransfers((prev) =>
        [
          {
            from,
            to,
            amount,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 10),
      ); // 최근 10개만 보여주기
    });

    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, [api]);

  if (isLoadingAssets || isLoadingBlocks) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Dashboard</h1>

      {/* 최근 블록 정보 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recent Blocks</h2>
        <div className="space-y-2">
          {recentBlocks?.map((block) => (
            <div key={block.hash} className="border p-3 rounded-lg">
              <p className="font-medium">Block #{block.number}</p>
              <p className="text-sm text-gray-600">Hash: {block.hash.slice(0, 16)}...</p>
              <p className="text-sm text-gray-600">
                Parent: {block.parentHash.slice(0, 16)}...
              </p>
              <p className="text-sm text-gray-600">Extrinsics: {block.extrinsicsCount}</p>
              <p className="text-sm text-gray-500">
                {new Date(block.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 에셋 목록 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets?.map((asset: AssetInfo) => (
            <div key={asset.id} className="border p-4 rounded-lg">
              <h3 className="font-medium">
                {asset.name} ({asset.symbol})
              </h3>
              <p>ID: {asset.id}</p>
              <p>Owner: {asset.owner}</p>
              <p>Total Supply: {asset.totalSupply}</p>
              <p>Decimals: {asset.decimals}</p>
              <p>Status: {asset.isFrozen ? 'Frozen' : 'Active'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 전송 이벤트 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Transfers</h2>
        <div className="space-y-2">
          {transfers.map((transfer, index) => (
            <div key={index} className="border p-3 rounded-lg">
              <p>From: {transfer.from}</p>
              <p>To: {transfer.to}</p>
              <p>Amount: {transfer.amount}</p>
              <p className="text-sm text-gray-500">
                {new Date(transfer.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
