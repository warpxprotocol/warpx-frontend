'use client';

import { Option } from '@polkadot/types-codec';
import { ITuple } from '@polkadot/types-codec/types';
import { FrameSupportTokensFungibleUnionOfNativeOrWithId } from '@polkadot/types/lookup';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

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
    <Link href={`/pools/${encodeURIComponent(pool.id)}`} className="contents">
      <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors cursor-pointer">
        <td className="py-3 px-4 font-medium text-white">{pool.name}</td>
        <td className="py-3 px-4 text-gray-300">{pool.protocol}</td>
        <td className="py-3 px-4 text-gray-300">{pool.feeTier}</td>
        <td className="py-3 px-4 text-gray-300">{pool.tvl}</td>
        <td className="py-3 px-4 text-gray-300">{pool.apr}</td>
      </tr>
    </Link>
  );
}

// PoolList 컴포넌트: 테이블 전체
function PoolList({ pools }: { pools: Pool[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#18181B] mt-8">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[#23232A] text-gray-400">
            <th className="py-3 px-4 text-left font-semibold">풀 이름</th>
            <th className="py-3 px-4 text-left font-semibold">프로토콜</th>
            <th className="py-3 px-4 text-left font-semibold">수수료 등급</th>
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

            const baseSymbol = baseAssetMetadata.symbol.toHuman();
            const quoteSymbol = quoteAssetMetadata.symbol.toHuman();

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
      <h1 className="text-2xl font-bold text-white mb-2">풀 리스트</h1>
      <p className="text-gray-400 mb-6">TVL, APR 등 다양한 정보를 한눈에 확인하세요.</p>
      <PoolList pools={pools} />
    </main>
  );
}
