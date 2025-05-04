'use client';

import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { isApiReady, useApi } from '@/hooks/useApi';

import {
  selectError,
  selectLoading,
  selectPoolInfo,
  usePoolDataFetcher,
  usePoolDataStore,
} from './context/PoolDataContext';

function formatCompact(value: number, decimals: number = 0): string {
  if (!value) return '0';
  const adjusted = value / Math.pow(10, decimals);
  return adjusted.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />;
}

function AMMInfoBox() {
  usePoolDataFetcher();
  const myRef = useRef<HTMLSpanElement>(null);

  // URL 파라미터 파싱
  const params = useParams();
  const pairParam = params?.pair as string | undefined;

  // 예: "DOT/USDT" → ["DOT", "USDT"]
  const [token0Symbol, token1Symbol] = pairParam
    ? decodeURIComponent(pairParam).split(/[\/-]/)
    : ['', ''];

  // Zustand 스토어에서 데이터 구독
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const loading = usePoolDataStore(selectLoading);
  const error = usePoolDataStore(selectError);
  const refreshPoolData = usePoolDataStore((state) => state.refreshPoolData);

  const metadata = usePoolDataStore((state) => state.metadata);
  const baseDecimals = metadata?.baseDecimals ?? 0;
  const quoteDecimals = metadata?.quoteDecimals ?? 0;
  const feeRate = metadata?.feeRate;

  // reserve, price 등은 poolInfo에서
  const reserve0 = poolInfo?.reserve0;
  const reserve1 = poolInfo?.reserve1;
  const poolPrice = poolInfo?.poolPrice;

  // 컴포넌트 마운트 시 데이터 갱신
  useEffect(() => {
    refreshPoolData();
  }, [refreshPoolData]);

  // URL에 페어 정보가 없는 경우 처리
  if (!pairParam) {
    return (
      <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
        <div className="text-gray-400 text-sm">Select a pool to view details</div>
      </div>
    );
  }

  // 메인 렌더링
  return (
    <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
      {/* 상단: PRICE / DEPTH */}
      <div className="flex w-full justify-between items-center mb-0.5">
        <span className="text-gray-400 text-xs font-medium tracking-widest">PRICE</span>
        <span className="text-gray-400 text-xs font-medium tracking-widest">DEPTH</span>
      </div>

      {/* 중앙: 가격 & 페어 정보 */}
      <div className="flex w-full items-center justify-between mb-1">
        <div className="flex flex-col">
          <div className="flex items-end mb-1">
            <>
              <span className="text-xl font-semibold text-white leading-none">
                {poolPrice !== undefined && poolPrice !== null
                  ? (poolPrice / Math.pow(10, poolInfo?.poolDecimals ?? 0)).toFixed(
                      poolInfo?.poolDecimals ?? 0,
                    )
                  : '-'}
              </span>
              <span className="ml-1 text-xs text-gray-400 font-medium">{token1Symbol}</span>
            </>
          </div>
          {/* Fee & Pair 정보 */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs">
              Fee: {feeRate !== undefined ? (feeRate * 100).toFixed(2) : '0.00'}%
            </span>
          </div>
        </div>

        {/* 우측 Depth 바 */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex flex-col items-end gap-1">
            <span
              className={`${!poolInfo || poolInfo.reserve0 === 0 ? 'bg-gray-700/50' : 'bg-gradient-to-r from-pink-500 to-purple-500'} rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between`}
            >
              <span className="text-white text-xs mr-1">{token0Symbol}</span>
              <span className="text-white font-medium text-xs">
                {reserve0 !== undefined ? formatCompact(reserve0, baseDecimals) : '0'}
              </span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`${!poolInfo || poolInfo.reserve1 === 0 ? 'bg-gray-700/50' : 'bg-gradient-to-r from-cyan-400 to-blue-500'} rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between`}
            >
              <span className="text-white text-xs mr-1">{token1Symbol}</span>
              <span className="text-white font-medium text-xs">
                {reserve1 !== undefined ? formatCompact(reserve1, quoteDecimals) : '0'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create a dynamic import of the AMMInfoBox component with no SSR
const AMMInfoBoxClient = dynamic(() => Promise.resolve(AMMInfoBox), {
  ssr: false,
});

export default function AMMInfoBoxWrapper() {
  return <AMMInfoBoxClient />;
}
