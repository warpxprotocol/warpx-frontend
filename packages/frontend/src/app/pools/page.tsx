'use client';

import { Option } from '@polkadot/types-codec';
import type { Codec } from '@polkadot/types-codec/types';
import { ITuple } from '@polkadot/types-codec/types';
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

type Enum = any; // 실제 Enum 타입 import 또는 선언
type u32 = any; // 실제 u32 타입 import 또는 선언

interface FrameSupportTokensFungibleUnionOfNativeOrWithId extends Enum {
  readonly isNative: boolean;
  readonly isWithId: boolean;
  readonly asWithId: u32;
  readonly type: 'Native' | 'WithId';
}

type Asset = { isWithId: boolean; asWithId: { toNumber(): number } };

function LoadingSkeleton() {
  return (
    <div className="w-full py-12 px-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-32 bg-gray-700/50 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-700/50 rounded animate-pulse" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#18181B] mt-8">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#23232A] text-gray-400">
              <th className="py-3 px-4 text-left font-semibold">POOL</th>
              <th className="py-3 px-4 text-left font-semibold">FEE TIER</th>
              <th className="py-3 px-4 text-left font-semibold">TVL</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-3 px-4">
                  <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
            const poolId = key.args[0] as ITuple<[Codec, Codec]>;
            const poolOption = value as Option<any>;

            if (!poolOption.isSome) {
              return null;
            }

            const poolInfo = poolOption.unwrap();

            // 풀의 자산 정보 가져오기
            const [baseAsset, quoteAsset] = poolId as unknown as [Asset, Asset];
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
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-red-500">Error: {error.message}</div>
      </main>
    );
  }

  return (
    <main className="w-full py-12 px-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">POOL LIST</h1>
          <p className="text-gray-400">
            Check various information such as TVL at a glance.
          </p>
        </div>
        <CreatePoolButton />
      </div>
      <PoolList pools={pools} />
    </main>
  );
}
