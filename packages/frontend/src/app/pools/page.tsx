'use client';

import { Option } from '@polkadot/types-codec';
import { ITuple } from '@polkadot/types-codec/types';
import type { FrameSupportTokensFungibleUnionOfNativeOrWithId } from '@warpx/sdk';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { CreatePoolButton } from '@/components/ui/create-pool-button';
import { useApi } from '@/hooks/useApi';

interface Pool {
  id: string;
  name: string;
  protocol: string;
  feeTier: string;
  tvl: string;
  apr: string;
}

// PoolRow 컴포넌트: 각 풀 정보를 한 줄로 렌더링
function PoolRow({ pool }: { pool: Pool }) {
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="py-3 px-4 font-medium text-white">
        <Link href={`/pools/${encodeURIComponent(pool.id)}`} className="block">
          {pool.name}
        </Link>
      </td>
      <td className="py-3 px-4 text-gray-300">
        <Link href={`/pools/${encodeURIComponent(pool.id)}`} className="block">
          {pool.protocol}
        </Link>
      </td>
      <td className="py-3 px-4 text-gray-300">
        <Link href={`/pools/${encodeURIComponent(pool.id)}`} className="block">
          {pool.feeTier}
        </Link>
      </td>
      <td className="py-3 px-4 text-gray-300">
        <Link href={`/pools/${encodeURIComponent(pool.id)}`} className="block">
          {pool.tvl}
        </Link>
      </td>
      <td className="py-3 px-4 text-gray-300">
        <Link href={`/pools/${encodeURIComponent(pool.id)}`} className="block">
          {pool.apr}
        </Link>
      </td>
    </tr>
  );
}

// PoolList 컴포넌트: 테이블 전체
function PoolList({ pools }: { pools: Pool[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#18181B] mt-8">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[#23232A] text-gray-400">
            <th className="py-3 px-4 text-left font-semibold">POOL</th>
            <th className="py-3 px-4 text-left font-semibold">PROTOCOL</th>
            <th className="py-3 px-4 text-left font-semibold">FEE TIER</th>
            <th className="py-3 px-4 text-left font-semibold">TVL</th>
            <th className="py-3 px-4 text-left font-semibold">APR</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <PoolRow key={pool.id} pool={pool} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// PoolsPage: 전체 페이지
export default function PoolsPage() {
  const { api, isLoading, error } = useApi();
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    const fetchPools = async () => {
      if (!api) return;

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
  }, [api]);

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
