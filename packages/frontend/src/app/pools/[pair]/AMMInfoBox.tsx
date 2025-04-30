import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { usePoolOperations } from '@/app/pools/[pair]/components/pools/usePoolOperations';
import { useApi } from '@/hooks/useApi';

import { PoolInfo } from './components/pools/poolQueries';
import { usePoolQueries } from './components/pools/poolQueries';

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

export default function AMMInfoBox() {
  // URL 파라미터 파싱
  const params = useParams();
  const searchParams = useSearchParams();
  const pairParam = params?.pair as string | undefined;

  // 쿼리 파라미터에서 baseId와 quoteId 가져오기
  const baseIdParam = searchParams.get('baseId');
  const quoteIdParam = searchParams.get('quoteId');
  const baseIdFromUrl = baseIdParam ? parseInt(baseIdParam, 10) : null;
  const quoteIdFromUrl = quoteIdParam ? parseInt(quoteIdParam, 10) : null;

  // API 및 계정 정보 가져오기
  const { api } = useApi();
  const { selectedAccount } = useWalletStore();
  const { getLpTokenBalance } = usePoolOperations();
  const { findPoolIndexByPair, getPoolQueryRpc } = usePoolQueries();

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

        // URL에서 토큰 심볼 추출 (UI 표시용)
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

        // baseId와 quoteId가 URL에 있는 경우 이를 사용
        let baseId = baseIdFromUrl;
        let quoteId = quoteIdFromUrl;

        // URL에 ID가 없는 경우에만 심볼로 ID 검색 시도
        if (baseId === null || quoteId === null) {
          // 심볼에 해당하는 토큰 ID 찾기
          const assetsData = await api?.query.assets.metadata.entries();

          if (!isMounted) return;

          if (!assetsData) {
            throw new Error('Failed to fetch assets metadata');
          }

          console.log(`Fetched ${assetsData.length} asset metadata entries`);

          // baseSymbol과 quoteSymbol에 해당하는 ID 찾기
          for (const entry of assetsData) {
            try {
              const assetId = (
                entry[0].args[0] as unknown as { toNumber: () => number }
              ).toNumber();
              const metadata = entry[1];
              const metadataHuman = metadata.toHuman();

              // 둘 다 찾았으면 중단
              if (baseId !== null && quoteId !== null) break;
            } catch (e) {
              console.error('Error processing asset metadata entry:', e);
            }
          }

          if (baseId === null || quoteId === null) {
            throw new Error(
              `Could not find assets with symbols ${baseSymbol} and/or ${quoteSymbol}`,
            );
          }
        }

        console.log(`Using baseId: ${baseId}, quoteId: ${quoteId} for pool query`);

        // 1. findPoolIndexByPair로 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseId, quoteId);
        console.log('Pool index found:', poolIndex);

        // 2. 풀 인덱스로 RPC 호출
        let poolData: PoolInfoDisplay = {
          baseAssetId: baseId,
          quoteAssetId: quoteId,
          reserve0: 0,
          reserve1: 0,
          lpTokenId: 0,
          feeTier: 0,
          poolExists: false,
          poolDecimals: 0,
          poolPrice: 0,
        };

        if (poolIndex !== null) {
          // 풀 인덱스가 있으면 RPC 호출로 자세한 정보 가져오기
          const poolQueryResult = await getPoolQueryRpc(baseId, quoteId);
          console.log('Pool query RPC result:', poolQueryResult);

          if (poolQueryResult.success && poolQueryResult.data) {
            // RPC 결과에서 PoolData 형식으로 변환
            const rpcData = poolQueryResult.data;

            // Some 또는 Option 형식인지 확인
            if (
              typeof rpcData === 'object' &&
              rpcData !== null &&
              ('isSome' in rpcData ||
                'Some' in rpcData ||
                !('isEmpty' in rpcData && !('None' in rpcData)))
            ) {
              const poolDataRaw =
                'isSome' in rpcData
                  ? typeof rpcData.isSome === 'boolean' && rpcData.isSome === true
                    ? rpcData.value || rpcData
                    : 'unwrap' in rpcData && typeof rpcData.unwrap === 'function'
                      ? (rpcData.unwrap as () => any)()
                      : rpcData
                  : 'Some' in rpcData
                    ? rpcData.Some
                    : rpcData;

              console.log('Unwrapped pool data:', poolDataRaw);

              // 풀 데이터 추출
              const extractNumericValue = (val: any) => {
                if (val === undefined || val === null) return 0;
                if (typeof val === 'number') return val;
                // 콤마 제거 후 숫자 변환
                return Number(String(val).replace(/,/g, ''));
              };

              try {
                // 새로운 API 응답 형식에 맞게 데이터 추출
                poolData = {
                  baseAssetId: extractNumericValue(
                    poolDataRaw.baseAssetId || poolDataRaw.base_asset_id,
                  ),
                  quoteAssetId: extractNumericValue(
                    poolDataRaw.quoteAssetId || poolDataRaw.quote_asset_id,
                  ),
                  // baseReserve와 quoteReserve가 직접 있는 경우 사용
                  reserve0: extractNumericValue(
                    poolDataRaw.baseReserve ||
                      poolDataRaw.base_reserve ||
                      poolDataRaw.reserve0 ||
                      poolDataRaw.reserve_0,
                  ),
                  reserve1: extractNumericValue(
                    poolDataRaw.quoteReserve ||
                      poolDataRaw.quote_reserve ||
                      poolDataRaw.reserve1 ||
                      poolDataRaw.reserve_1,
                  ),
                  // lpTokenId 추출 시도
                  lpTokenId: extractNumericValue(
                    poolDataRaw.lpTokenId || poolDataRaw.lp_token_id,
                  ),
                  // feeTier 추출 - takerFeeRate가 문자열(예: "0.03%")로 오는 경우 처리
                  feeTier: poolDataRaw.takerFeeRate
                    ? extractNumericValue(
                        String(poolDataRaw.takerFeeRate).replace('%', ''),
                      ) * 100 // 예: "0.03%" → 3
                    : extractNumericValue(poolDataRaw.feeTier || poolDataRaw.fee_tier),
                  poolExists: true,
                  poolIndex: poolIndex,
                  // 추가 정보 저장
                  poolDecimals: extractNumericValue(
                    poolDataRaw.poolDecimals || poolDataRaw.pool_decimals,
                  ),
                  poolPrice: extractNumericValue(
                    poolDataRaw.poolPrice || poolDataRaw.pool_price,
                  ),
                };

                console.log('Parsed pool data:', poolData);
              } catch (e) {
                console.error('Error processing pool RPC data:', e);
              }
            }
          } else {
            console.log('Pool query RPC failed or returned empty data');
          }
        }

        console.log('Pool info retrieved:', poolData);

        if (!isMounted) return;

        // 토큰 심볼과 소수점 정보 가져오기
        const token0MetadataRaw = await api.query.assets.metadata(baseId);
        const token1MetadataRaw = await api.query.assets.metadata(quoteId);

        if (!isMounted) return;

        const token0Metadata = token0MetadataRaw.toHuman();
        const token1Metadata = token1MetadataRaw.toHuman();

        const lpTokenMetadataRaw = await api.query.assets.metadata(poolData.lpTokenId);
        const lpTokenMetadata = lpTokenMetadataRaw.toHuman();

        // 풀 정보에 추가 메타데이터 병합
        const enhancedPoolInfo: PoolInfoDisplay = {
          ...poolData,
        };

        console.log('Enhanced pool info:', enhancedPoolInfo);
        setPoolInfo(enhancedPoolInfo);
        setLoading(false);

        // LP 토큰 잔액 조회 (계정이 연결된 경우에만)
        if (
          selectedAccount &&
          typeof selectedAccount === 'object' &&
          'address' in selectedAccount &&
          poolData &&
          poolData.poolExists &&
          poolData.lpTokenId
        ) {
          try {
            // 풀이 실제로 존재하고 lpTokenId가 유효한 경우에만 시도
            if (poolData.lpTokenId > 0) {
              const lpBalance = await getLpTokenBalance(
                poolData.baseAssetId,
                poolData.quoteAssetId,
                (selectedAccount as { address: string }).address,
              );
              if (!isMounted) return;
              console.log('LP token balance:', lpBalance);
            } else {
              console.log(
                'Skip LP token balance check - invalid lpTokenId:',
                poolData.lpTokenId,
              );
            }
          } catch (e) {
            console.error('Error fetching LP token balance:', e);
            // LP 토큰 잔액 조회 오류는 치명적이지 않음 - UI에 표시될 정보에는 영향 없음
          }
        } else if (selectedAccount) {
          console.log('Skip LP token balance check - pool does not exist or no lpTokenId');
        }
      } catch (error) {
        console.error('Error fetching pool data:', error);
        if (isMounted) {
          setError(String(error));
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
          setError(String(error));
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
  }, [
    api,
    selectedAccount,
    pairParam,
    getLpTokenBalance,
    findPoolIndexByPair,
    getPoolQueryRpc,
  ]);

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
          {/* 디버깅 정보 - 개발 중에만 활성화하고 나중에 제거 */}
          {(() => {
            // 디버깅용 로그
            console.log('PoolInfo Debug:', {
              reserve0: poolInfo?.reserve0,
              reserve1: poolInfo?.reserve1,
              poolDecimals: poolInfo?.poolDecimals,
              baseAssetDecimals: poolInfo?.baseAssetDecimals,
              quoteAssetDecimals: poolInfo?.quoteAssetDecimals,
            });

            // formatWithDecimals 테스트
            if (poolInfo?.reserve0) {
              console.log('Format Test:', {
                raw: poolInfo.reserve0,
                decimals: poolInfo.poolDecimals ?? 0,
                formatted: formatWithDecimals(
                  poolInfo.reserve0,
                  poolInfo.poolDecimals ?? 0,
                ),
                hardcodedTest: formatWithDecimals('123456789000', 6), // 예상 결과: "123.456789"
              });
            }
            return null;
          })()}

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
                    {poolInfo?.reserve0 !== undefined
                      ? formatCompactTrimmed(
                          poolInfo.reserve0,
                          poolInfo.baseAssetDecimals ?? 0,
                        )
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
                      ? formatCompactTrimmed(
                          poolInfo.reserve1,
                          poolInfo.quoteAssetDecimals ?? 0,
                        )
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
