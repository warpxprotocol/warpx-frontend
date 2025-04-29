import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { usePoolOperations } from '@/app/pools/[pair]/components/pools/usePoolOperations';
import { useApi } from '@/hooks/useApi';

import { PoolInfo } from './components/pools/poolQueries';

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
}

export default function AMMInfoBox() {
  // URL 파라미터 파싱
  const params = useParams();
  const pairParam = params?.pair as string | undefined;

  // API 및 계정 정보 가져오기
  const { api } = useApi();
  const { selectedAccount } = useWalletStore();
  const { getLpTokenBalance, getPoolInfoByPair } = usePoolOperations();

  // 상태 관리
  const [poolInfo, setPoolInfo] = useState<PoolInfoDisplay | null>(null);
  const [token0Symbol, setToken0Symbol] = useState<string>('');
  const [token1Symbol, setToken1Symbol] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API 및 계정 상태 변경 디버깅
  useEffect(() => {
    console.log('API state changed:', !!api, api ? 'connected' : 'disconnected');
    console.log(
      'Account state changed:',
      !!selectedAccount,
      // 계정 주소 값을 안전하게 처리
      selectedAccount && typeof selectedAccount === 'object' && 'address' in selectedAccount
        ? (selectedAccount as { address: string }).address
        : 'undefined',
    );
  }, [api, selectedAccount]);

  // 데이터 갱신 간격 (밀리초 단위)
  const POLLING_INTERVAL = 5000; // 5초마다 갱신

  // 데이터 가져오기
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    if (!pairParam) {
      setLoading(false);
      return;
    }

    // 실제 데이터 가져오기 함수
    const fetchData = async () => {
      try {
        if (!isMounted) return;

        if (!api) {
          console.error('fetchData called but API is not available');
          return;
        }

        // 계정 없음 상태 기록
        if (!selectedAccount) {
          console.log('Note: No account connected, will fetch pool info only');
        }

        setLoading(true);
        setError(null);

        // URL에서 토큰 ID 추출
        console.log('Processing pair parameter:', pairParam);
        // URL 디코딩: %2F는 '/' 문자로 디코딩
        const decodedParam = decodeURIComponent(pairParam);
        console.log('Decoded pair parameter:', decodedParam);

        const pairParts = decodedParam.split('/');
        console.log('Pair parts:', pairParts);

        if (pairParts.length !== 2) {
          throw new Error(
            `Invalid pair format in URL: ${decodedParam} (split result: ${pairParts.join(', ')})`,
          );
        }

        const [baseSymbol, quoteSymbol] = pairParts;
        if (!baseSymbol || !quoteSymbol) {
          throw new Error('Missing token symbols in pair');
        }

        if (isMounted) {
          setToken0Symbol(baseSymbol);
          setToken1Symbol(quoteSymbol);
        }

        // 심볼에 해당하는 토큰 ID 찾기
        const assetsData = await api?.query.assets.metadata.entries();

        if (!isMounted) return;

        let baseId: number | null = null;
        let quoteId: number | null = null;

        if (!assetsData) {
          throw new Error('Failed to fetch asset metadata');
        }

        for (const entry of assetsData) {
          try {
            const id = entry[0].args[0];
            const meta = entry[1].toHuman();
            if (meta && typeof meta === 'object' && 'symbol' in meta) {
              const symbol = String(meta.symbol || '');
              if (symbol === baseSymbol) baseId = Number(id);
              if (symbol === quoteSymbol) quoteId = Number(id);
              if (baseId !== null && quoteId !== null) break;
            }
          } catch (err) {
            console.error('Error processing asset entry:', err);
          }
        }

        if (!isMounted) return;

        if (baseId === null || quoteId === null) {
          throw new Error(
            `Could not find token IDs for symbols: ${baseSymbol}, ${quoteSymbol}`,
          );
        }

        // 풀 정보 가져오기
        let poolInfoData: PoolInfo | null = null;
        try {
          console.log('Fetching pool info for baseId:', baseId, 'quoteId:', quoteId);
          poolInfoData = await getPoolInfoByPair(baseId, quoteId);
          console.log('Pool info data received:', poolInfoData);

          // 풀 정보 정리 - PoolInfo 타입은 이미 알맞게 정의되어 있음
          if (poolInfoData) {
            // PoolInfoDisplay 타입에 맞게 변환
            const cleanedPoolInfo: PoolInfoDisplay = {
              // PoolInfo의 필수 필드
              poolExists: poolInfoData.poolExists,
              baseAssetId: poolInfoData.baseAssetId,
              quoteAssetId: poolInfoData.quoteAssetId,
              feeTier: poolInfoData.feeTier,
              reserve0: poolInfoData.reserve0,
              reserve1: poolInfoData.reserve1,
              lpTokenId: poolInfoData.lpTokenId,
              // 선택적 필드
              poolIndex: poolInfoData.poolIndex,

              // UI에 필요한 추가 필드는 현재 없지만 필요할 수 있음
              baseAssetSymbol: token0Symbol,
              quoteAssetSymbol: token1Symbol,
              // 나중에 필요하면 추가
              // baseAssetDecimals: 0,
              // quoteAssetDecimals: 0,
              // lpTokenSymbol: '',
              // lpTokenDecimals: 0,
            };

            console.log('Pool info:', cleanedPoolInfo);
            console.log(
              'Has liquidity:',
              typeof cleanedPoolInfo.reserve0 === 'number' &&
                cleanedPoolInfo.reserve0 > 0 &&
                typeof cleanedPoolInfo.reserve1 === 'number' &&
                cleanedPoolInfo.reserve1 > 0,
            );
            setPoolInfo(cleanedPoolInfo);
          }
        } catch (err) {
          console.error('Error fetching pool info:', err);
          setError(
            `Failed to fetch pool information: ${err instanceof Error ? err.message || 'Unknown error' : 'Unknown error'}`,
          );
        }

        if (!isMounted) return;

        // 계정이 연결되었으나 LP 토큰 정보는 별도 컴포넌트로 분리
        if (poolInfoData && poolInfoData.poolExists && selectedAccount) {
          console.log(
            'Account connected, but LP position info moved to separate component',
          );
        }

        // 폴링이 아니라 초기 로드인 경우에만 로딩 상태 해제
        if (!retryCount) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching AMMInfoBox data:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // API나 계정이 준비되지 않았을 때 재시도 로직
    const attemptFetch = async () => {
      if (!api) {
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`API not ready, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(attemptFetch, 1500); // 1.5초 후 재시도
        } else if (isMounted) {
          setLoading(false);
          setError('API not available after multiple attempts');
        }
        return;
      }

      // API만 로드되어도 기본 풀 정보는 가져오기 시도
      console.log('API is ready, proceeding with or without account');

      // API와 계정이 준비되면 실제 데이터 가져오기 실행
      try {
        await fetchData();
      } catch (error) {
        console.error('Error during data fetch:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          setLoading(false);
        }
      }
    };

    // 초기 시도 시작
    attemptFetch();

    // 풀 정보 주기적 갱신 설정
    const pollingInterval = setInterval(() => {
      if (isMounted && api) {
        console.log('Polling for pool info updates...');
        fetchData();
      }
    }, POLLING_INTERVAL);

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, [api, selectedAccount, pairParam, getLpTokenBalance, getPoolInfoByPair]);

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
        {!selectedAccount && (
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
                  {poolInfo?.poolExists &&
                  (poolInfo.reserve0 ?? 0) > 0 &&
                  (poolInfo.reserve1 ?? 0) > 0
                    ? (poolInfo.reserve1 / poolInfo.reserve0).toFixed(6)
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
                    {typeof poolInfo?.reserve0 === 'number'
                      ? poolInfo.reserve0.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
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
                    {typeof poolInfo?.reserve1 === 'number'
                      ? poolInfo.reserve1.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
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
