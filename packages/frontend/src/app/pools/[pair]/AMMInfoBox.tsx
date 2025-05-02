'use client';

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { usePoolOperations } from '@/app/pools/[pair]/components/pools/usePoolOperations';
import { useApi } from '@/hooks/useApi';

import { PoolInfo } from './components/pools/poolQueries';
import { usePoolQueries } from './components/pools/poolQueries';
import {
  selectError,
  selectLoading,
  selectPoolInfo,
  usePoolDataStore,
} from './context/PoolDataContext';

// 인터페이스 및 타입 정의
interface LpTokenBalanceType {
  lpTokenId: number;
  rawBalance: string;
  humanReadableBalance: number;
  lpTokenSymbol: string;
  lpTokenDecimals: number;
  baseAssetId: number;
  quoteAssetId: number;
}

// 리팩토링된 PoolInfo 타입을 사용하되, 로컬 처리를 위한 디스플레이 타입 정의
// UI 표시에 필요한 추가 필드 포함
interface PoolInfoDisplay extends PoolInfo {
  // AMMInfoBox에서 표시에 필요한 추가 필드
  baseAssetSymbol?: string;
  quoteAssetSymbol?: string;
  baseAssetDecimals?: number;
  quoteAssetDecimals?: number;
  lpTokenSymbol?: string;
  lpTokenDecimals?: number;
  poolDecimals?: number;
  poolPrice?: number;
}

/**
 * Format a number with appropriate decimals for human-readable display
 * @param raw The raw value (string or number)
 * @param decimals The number of decimals to adjust by
 * @returns Formatted string with appropriate decimal places
 */
function formatWithDecimals(raw: string | number, decimals: number): string {
  const num = typeof raw === 'string' ? Number(raw.replace(/,/g, '')) : raw;
  if (isNaN(num)) return '-';

  const adjusted = num / Math.pow(10, decimals);
  return adjusted.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/**
 * Format a number with compact notation and trim if too long
 * @param raw The raw value (string or number)
 * @param decimals The number of decimals to adjust by
 * @param maxLength Maximum length of the output string before trimming
 * @returns Formatted compact string (e.g. 1.2M, 3.5B) with length limitation
 */
function formatCompactTrimmed(
  raw: string | number,
  decimals: number,
  maxLength: number = 8,
): string {
  const num = typeof raw === 'string' ? Number(raw.replace(/,/g, '')) : raw;
  if (isNaN(num)) return '-';

  const adjusted = num / Math.pow(10, decimals);
  const compact = adjusted.toLocaleString(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2,
  });

  return compact.length > maxLength ? compact.slice(0, maxLength - 1) + '…' : compact;
}

/**
 * 과학적 표기법을 사용하여 리저브 값 표시
 * @param value 원시 리저브 값
 * @param decimals 토큰 데시멀
 * @returns 과학적 표기법 문자열 (예: 1.10e+19)
 */
function formatScientific(value: number, decimals: number = 0): string {
  if (value === 0) return '0';

  // 원시 값 그대로 과학적 표기법으로 변환 (데시멀 적용 안함)
  const rawScientific = value.toExponential(2);

  // decimals를 고려하여 실제 값으로 변환하여 표시할 경우:
  // const adjusted = value / Math.pow(10, decimals);
  // return adjusted.toExponential(2);

  return rawScientific;
}

/**
 * 긴 숫자를 decimals에 맞게 조정하고 첫 3자리만 표시 후 생략
 * @param value 변환할 숫자 값
 * @param decimals decimals 값
 * @returns 포맷팅된 문자열 (예: "123...")
 */
function formatShortWithDecimals(value: number, decimals: number): string {
  if (value === 0) return '0';

  // decimals로 나누어 실제 값으로 변환
  const adjusted = value / Math.pow(10, decimals);

  // 숫자를 문자열로 변환
  const numStr = adjusted.toString();

  // 소수점 위치 찾기
  const dotIndex = numStr.indexOf('.');

  // 소수점이 없으면 앞 3자리만 표시
  if (dotIndex === -1) {
    return numStr.length > 3 ? `${numStr.substring(0, 3)}...` : numStr;
  }

  // 소수점이 있으면 소수점 포함 총 4자리(소수점 + 소수점 이하 3자리)까지 표시
  if (dotIndex === 0) {
    // 0.xxx 형태
    return `${numStr.substring(0, Math.min(numStr.length, 5))}${numStr.length > 5 ? '...' : ''}`;
  }

  // 정수부 + 소수점 + 소수 3자리까지 표시
  const digitsBeforeDot = dotIndex;
  const maxLength = digitsBeforeDot + 5; // 소수점(1) + 소수자리(3) = 4, 그리고 기존 정수부

  return `${numStr.substring(0, Math.min(numStr.length, maxLength))}${numStr.length > maxLength ? '...' : ''}`;
}

export default function AMMInfoBox() {
  // URL 파라미터 파싱
  const params = useParams();
  const searchParams = useSearchParams();
  const pairParam = params?.pair as string | undefined;

  // Zustand 스토어에서 데이터 구독
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const loading = usePoolDataStore(selectLoading);
  const error = usePoolDataStore(selectError);
  const refreshPoolData = usePoolDataStore((state) => state.refreshPoolData);

  // 토큰 심볼 추출 (UI 표시용)
  const token0Symbol = poolInfo?.baseAssetSymbol || '';
  const token1Symbol = poolInfo?.quoteAssetSymbol || '';

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

  // 에러 발생 시 처리
  if (error) {
    return (
      <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
        <div className="text-red-400 text-sm">Error: {error}</div>
        {!useWalletStore.getState().selectedAccount && (
          <div className="text-yellow-400 text-sm mt-2">
            Connect wallet to view your LP position.
          </div>
        )}
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <span className="text-gray-400 text-sm">Loading pool information...</span>
        </div>
      ) : (
        <>
          {/* 중앙: 가격 & 페어 정보 */}
          <div className="flex w-full items-center justify-between mb-1">
            <div className="flex flex-col">
              <div className="flex items-end mb-1">
                <span className="text-xl font-semibold text-white leading-none">
                  {poolInfo?.poolPrice &&
                  (poolInfo.reserve0 ?? 0) > 0 &&
                  (poolInfo.reserve1 ?? 0) > 0
                    ? (
                        (poolInfo.reserve1 *
                          Math.pow(10, poolInfo.baseAssetDecimals ?? 0)) /
                        (poolInfo.reserve0 * Math.pow(10, poolInfo.quoteAssetDecimals ?? 0))
                      ).toFixed((poolInfo.poolDecimals ?? 0) + 2)
                    : '-'}
                </span>
                <span className="ml-1 text-xs text-gray-400 font-medium">
                  {token1Symbol}
                </span>
              </div>
              {/* Fee & Pair 정보 */}
              <div className="flex items-center gap-1.5">
                {poolInfo?.feeTier !== undefined && (
                  <span className="text-gray-400 text-xs">
                    Fee:{' '}
                    {poolInfo.feeTier === 0 ? '0.00' : (poolInfo.feeTier / 100).toFixed(2)}%
                  </span>
                )}
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
                    {poolInfo?.reserve0 !== undefined
                      ? formatScientific(poolInfo.reserve0)
                      : '0'}
                  </span>
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`${!poolInfo || poolInfo.reserve1 === 0 ? 'bg-gray-700/50' : 'bg-gradient-to-r from-cyan-400 to-blue-500'} rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between`}
                >
                  <span className="text-white text-xs mr-1">{token1Symbol}</span>
                  <span className="text-white font-medium text-xs">
                    {poolInfo?.reserve1 !== undefined
                      ? formatScientific(poolInfo.reserve1)
                      : '0'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
