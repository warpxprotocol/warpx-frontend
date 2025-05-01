'use client';

import { Option } from '@polkadot/types-codec';
import { ITuple } from '@polkadot/types-codec/types';
import type { FrameSupportTokensFungibleUnionOfNativeOrWithId } from '@warpx/sdk/interfaces/custom-exports';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

import { Pool } from '@/app/pools/[pair]/components/pools/types';
import { useApi } from '@/hooks/useApi';

// pool list data 불러오는거 개선
// create Pool + first add lp
// polkadot Porotocol x, APR

// 모든 클라이언트 컴포넌트를 동적으로 로드하여 SSR 문제 해결
const PoolList = dynamic(
  () => import('@/app/pools/[pair]/components/pools/PoolList').then((mod) => mod.PoolList),
  { ssr: false },
);

const CreatePoolButton = dynamic(
  () =>
    import('@/app/pools/[pair]/components/pools/CreatePoolButton').then(
      (mod) => mod.CreatePoolButton,
    ),
  { ssr: false },
);

export default function PoolsPage() {
  const { api, isLoading, error } = useApi();
  const [pools, setPools] = useState<Pool[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!api || !isMounted) return;

    const fetchPools = async () => {
      try {
        // hybridOrderbook 팔렛의 pools 스토리지에서 모든 풀 데이터 가져오기
        const poolsData = await api.query.hybridOrderbook.pools.entries();

        const formattedPools = await Promise.all(
          poolsData.map(async ([key, value]) => {
            const poolId = key.args[0] as ITuple<
              [
                FrameSupportTokensFungibleUnionOfNativeOrWithId,
                FrameSupportTokensFungibleUnionOfNativeOrWithId,
              ]
            >;
            const poolOption = value as Option<any>;

            if (!poolOption.isSome) {
              return null;
            }

            const poolInfo = poolOption.unwrap();

            // 풀의 자산 정보 가져오기
            const [baseAsset, quoteAsset] = poolId;
            const baseAssetId = baseAsset.isWithId ? baseAsset.asWithId.toNumber() : 0;
            const quoteAssetId = quoteAsset.isWithId ? quoteAsset.asWithId.toNumber() : 0;

            // 자산 메타데이터 가져오기
            const baseAssetMetadata = await api.query.assets.metadata(baseAssetId);
            const quoteAssetMetadata = await api.query.assets.metadata(quoteAssetId);

            // 메타데이터에서 심볼을 가져오거나 ID를 사용
            const baseSymbol =
              (baseAssetMetadata?.toHuman() as { symbol?: string })?.symbol ||
              `Asset ${baseAssetId}`;
            const quoteSymbol =
              (quoteAssetMetadata?.toHuman() as { symbol?: string })?.symbol ||
              `Asset ${quoteAssetId}`;

            // 수수료 비율 계산 (Permill을 퍼센트로 변환)
            const takerFeeRate = poolInfo.takerFeeRate.toNumber() / 10000;

            return {
              id: `${baseSymbol}/${quoteSymbol}`,
              name: `${baseSymbol}/${quoteSymbol}`,
              protocol: 'v4',
              feeTier: `${takerFeeRate}%`,
              tvl: '$0', // TODO: 실제 TVL 계산 필요
              apr: '0%', // TODO: 실제 APR 계산 필요
              token0: {
                id: baseAssetId,
                symbol: baseSymbol,
                iconUrl: '', // TODO: provide icon URL
                usdPrice: 0, // TODO: fetch current USD price
              },
              token1: {
                id: quoteAssetId,
                symbol: quoteSymbol,
                iconUrl: '', // TODO: provide icon URL
                usdPrice: 0, // TODO: fetch current USD price
              },
            };
          }),
        );

        // null 값 필터링
        setPools(formattedPools.filter((pool): pool is Pool => pool !== null));
      } catch (err) {
        console.error('Error fetching pools:', err);
      }
    };

    fetchPools();
  }, [api, isMounted]);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-white">Loading pools...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-red-500">Error: {error.message}</div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">POOL LIST</h1>
          <p className="text-gray-400">
            Check various information such as TVL, APR at a glance.
          </p>
        </div>
        <CreatePoolButton />
      </div>
      <PoolList pools={pools} />
    </main>
  );
}
