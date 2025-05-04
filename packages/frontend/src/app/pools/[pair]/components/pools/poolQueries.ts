import { useCallback, useRef } from 'react';

import { useApi } from '@/hooks/useApi';
import { isApiReady } from '@/hooks/useApi';

import { extractDecimals, extractId } from './utils';

// 풀 정보 타입
export interface PoolInfo {
  baseAssetId: number;
  quoteAssetId: number;
  reserve0: number;
  reserve1: number;
  lpTokenId: number;
  feeTier: number;
  poolExists: boolean;
  poolIndex?: number; // 풀 인덱스 (선택적)
}

function withApiReady(api: any, isConnected: any, isReady: any, fn: any) {
  if (!isApiReady(api, isConnected, isReady)) {
    throw new Error('API not connected');
  }
  return fn();
}

/**
 * 풀 조회 관련 함수들을 제공하는 훅
 */
export const usePoolQueries = () => {
  const { api, isConnected, isReady } = useApi();

  const poolIndexCache = useRef(new Map());
  const poolInfoCache = useRef(new Map());
  const poolMetadataCache = useRef(new Map<string, any>());

  /**
   * 토큰 페어로 풀 인덱스를 찾는 함수
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @returns 풀 인덱스 (찾지 못한 경우 null)
   */
  const findPoolIndexByPair = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<number | null> => {
      return withApiReady(api, isConnected, isReady, async () => {
        if (!api) throw new Error('API not connected');
        const poolsData = await api.query.hybridOrderbook.pools.entries();
        // Make sure baseAssetId and quoteAssetId are valid numbers
        const id0 = Number(baseAssetId);
        const id1 = Number(quoteAssetId);

        if (isNaN(id0) || isNaN(id1)) {
          console.error('[findPoolIndexByPair] Invalid IDs:', baseAssetId, quoteAssetId);
          return null;
        }

        // 모든 풀 엔트리 처리
        for (let entryIndex = 0; entryIndex < poolsData.length; entryIndex++) {
          const entry = poolsData[entryIndex] as any;
          try {
            if (!entry || !Array.isArray(entry) || entry.length < 2) {
              continue;
            }

            const key = entry[0];
            const value = entry[1];

            // 값에서 토큰 ID 추출 시도 (두 가지 방법)
            let poolAssetIds: number[] = [];
            let poolIndex: number | null = null;

            // 1. 키에서 풀 인덱스 추출 시도
            try {
              // 키의 구조 확인
              const keyHuman = key.toHuman ? key.toHuman() : null;

              // 키에서 풀 인덱스를 추출하기 위한 여러 방법 시도
              // 방법 1: key.args[0]에서 추출
              if (key.args && key.args[0]) {
                if (typeof key.args[0].toNumber === 'function') {
                  poolIndex = key.args[0].toNumber();
                } else if (typeof key.args[0] === 'object' && 'valueOf' in key.args[0]) {
                  poolIndex = Number(key.args[0].valueOf());
                } else {
                  poolIndex = Number(key.args[0]);
                }
              }

              // 방법 2: 키 구조에서 추출
              if ((poolIndex === null || isNaN(poolIndex)) && keyHuman) {
                if (Array.isArray(keyHuman) && keyHuman.length > 0) {
                  if (typeof keyHuman[0] === 'number') {
                    poolIndex = Number(keyHuman[0]);
                  } else if (Array.isArray(keyHuman[0]) && keyHuman[0].length > 0) {
                    if (typeof keyHuman[0][0] === 'number') {
                      poolIndex = Number(keyHuman[0][0]);
                    }
                  }
                }
              }

              // 방법 3: 최후의 수단 - 배열 인덱스를 풀 인덱스로 사용
              if (poolIndex === null || isNaN(poolIndex)) {
                poolIndex = entryIndex;
              }
            } catch (e) {
              poolIndex = entryIndex;
            }

            // 2. 키의 다른 인자 또는 값에서 토큰 ID 추출 시도
            try {
              // 키 구조 분석
              const keyHuman = key.toHuman ? key.toHuman() : null;

              // 중첩된 배열 구조 처리
              if (keyHuman && Array.isArray(keyHuman)) {
                let assetPairData = null;

                // 첫 번째 요소가 배열인 경우 (중첩 배열)
                if (keyHuman.length > 0 && Array.isArray(keyHuman[0])) {
                  // 중첩 배열 [[{WithId:1}, {WithId:2}]]
                  assetPairData = keyHuman[0];
                }
                // 두 번째 요소가 자산 쌍일 수 있음
                else if (keyHuman.length > 1) {
                  assetPairData = keyHuman[1];
                }

                // assetPairData가 배열인 경우
                if (Array.isArray(assetPairData)) {
                  poolAssetIds = assetPairData
                    .map((item) => {
                      // WithId 형식인 경우
                      if (item && typeof item === 'object' && 'WithId' in item) {
                        return Number(item.WithId);
                      }
                      // 단순 숫자인 경우
                      else if (typeof item === 'number') {
                        return item;
                      }
                      // 기타 형식
                      else {
                        const extractedId = extractId(item);
                        return extractedId !== null ? extractedId : NaN;
                      }
                    })
                    .filter((id) => !isNaN(id)); // 유효한 ID만 필터링
                }
                // assetPairData가 객체인 경우
                else if (assetPairData && typeof assetPairData === 'object') {
                  const asset1 = assetPairData.base_asset_id || assetPairData.baseAssetId;
                  const asset2 = assetPairData.quote_asset_id || assetPairData.quoteAssetId;

                  if (asset1 !== undefined) poolAssetIds.push(Number(asset1));
                  if (asset2 !== undefined) poolAssetIds.push(Number(asset2));
                }
              }

              // 추가: 중첩 배열 대응을 위한 마지막 옵션
              if (poolAssetIds.length === 0) {
                // keyHuman에서 WithId 객체를 재귀적으로 찾아서 처리
                const findWithIdObjects = (obj: any): number[] => {
                  if (!obj) return [];

                  // 배열인 경우 각 요소에 대해 재귀 호출
                  if (Array.isArray(obj)) {
                    return obj.flatMap((item) => findWithIdObjects(item));
                  }

                  // WithId 객체인 경우
                  if (typeof obj === 'object' && 'WithId' in obj) {
                    return [Number(obj.WithId)];
                  }

                  // 다른 객체인 경우 모든 속성에 대해 재귀 호출
                  if (typeof obj === 'object' && obj !== null) {
                    return Object.values(obj).flatMap((val) => findWithIdObjects(val));
                  }

                  return [];
                };

                poolAssetIds = findWithIdObjects(keyHuman);
              }

              // 값에서도 토큰 ID 추출 시도 (fallback)
              if (poolAssetIds.length < 2) {
                const valueHuman = value.toHuman ? value.toHuman() : null;
                if (valueHuman && typeof valueHuman === 'object') {
                  const asset1 = valueHuman.base_asset_id || valueHuman.baseAssetId;
                  const asset2 = valueHuman.quote_asset_id || valueHuman.quoteAssetId;

                  // 이미 추출된 ID와 중복되지 않게 추가
                  if (asset1 !== undefined && !poolAssetIds.includes(Number(asset1))) {
                    poolAssetIds.push(Number(asset1));
                  }
                  if (asset2 !== undefined && !poolAssetIds.includes(Number(asset2))) {
                    poolAssetIds.push(Number(asset2));
                  }
                }
              }
            } catch (e) {
              console.error('[findPoolIndexByPair] 자산 ID 추출 실패:', e);
            }

            // 3. 자산 ID 비교로 페어 매칭 확인
            if (
              poolAssetIds.length >= 2 &&
              poolAssetIds[0] === id0 &&
              poolAssetIds[1] === id1 &&
              poolIndex !== null
            ) {
              console.log('[findPoolIndexByPair] 매칭 성공', {
                poolIndex,
                poolAssetIds,
                baseAssetId: id0,
                quoteAssetId: id1,
              });
              return poolIndex;
            }
          } catch (e) {
            console.error('[findPoolIndexByPair] Entry 처리 중 오류:', e);
            continue; // 현재 엔트리 오류, 다음으로 진행
          }
        }
        return null;
      });
    },
    [api, isConnected, isReady],
  );

  /**
   * 풀 인덱스를 이용하여 풀 정보 조회 함수
   * @param poolIndex 풀 인덱스
   * @returns 풀 정보
   */
  const getPoolInfo = useCallback(
    async (poolIndex: number): Promise<PoolInfo> => {
      // 캐시 확인
      if (poolInfoCache.current.has(poolIndex)) {
        return poolInfoCache.current.get(poolIndex);
      }

      return withApiReady(api, isConnected, isReady, async () => {
        if (!api) throw new Error('API not connected');

        // 방어적 코딩: poolIndex가 유효한 숫자인지 확인
        if (isNaN(poolIndex)) {
          console.error('[getPoolInfo] Invalid pool index: NaN');
          // 풀이 없을 때와 동일한 기본 구조 반환
          return {
            baseAssetId: 0,
            quoteAssetId: 0,
            reserve0: 0,
            reserve1: 0,
            lpTokenId: 0,
            feeTier: 0,
            poolExists: false,
          };
        }

        try {
          // 풀 인덱스로 직접 쿼리
          const poolRawData = await api.query.hybridOrderbook.pools(poolIndex);
          const valueHuman = poolRawData.toHuman();

          if (!valueHuman || Object.keys(valueHuman).length === 0) {
            return {
              baseAssetId: 0,
              quoteAssetId: 0,
              reserve0: 0,
              reserve1: 0,
              lpTokenId: 0,
              feeTier: 0,
              poolExists: false,
            };
          }

          // 필요한 인터페이스 정의 (valueHuman에 대한 타입 힌트)
          interface PoolData {
            baseAssetId?: unknown;
            base_asset_id?: unknown;
            quoteAssetId?: unknown;
            quote_asset_id?: unknown;
            reserve0?: unknown;
            reserve1?: unknown;
            balance?: unknown[];
            liquidity?: {
              base?: unknown;
              quote?: unknown;
            };
            lpToken?: unknown;
            lp_token?: unknown;
            feeTier?: unknown;
            fee_tier?: unknown;
          }

          // 타입 캐스팅으로 더 안전한 접근 제공
          const poolData = valueHuman as PoolData; // valueHuman을 타입이 정의된 PoolData로 변환

          // 풀 데이터에서 필요한 정보 추출 (필드 이름 일관성 문제 해결)
          const baseAssetId = extractId(poolData.baseAssetId || poolData.base_asset_id);
          const quoteAssetId = extractId(poolData.quoteAssetId || poolData.quote_asset_id);

          // 유동성 데이터 추출 (우선순위를 명확히 설정)
          let reserve0: number = 0;
          let reserve1: number = 0;

          // 데이터 소스 우선순위를 명확히 함
          // 1. liquidity 필드 (가장 우선)
          // 2. direct reserve 필드
          // 3. balance 배열
          let dataSource = 'default';

          // 1. liquidity 필드에서 확인 (최우선)
          if (poolData.liquidity) {
            try {
              if (poolData.liquidity.base !== undefined) {
                reserve0 = Number(poolData.liquidity.base);
                dataSource = 'liquidity.base';
              }
              if (poolData.liquidity.quote !== undefined) {
                reserve1 = Number(poolData.liquidity.quote);
                dataSource = 'liquidity.quote';
              }
            } catch (e) {
              console.error('[getPoolInfo] Error parsing liquidity data:', e);
              // 오류 발생 시 다음 데이터 소스로 진행 (폴백 전략)
            }
          }

          // 2. reserve 필드에서 확인 (liquidity에서 찾지 못한 경우에만)
          if (reserve0 === 0 && poolData.reserve0 !== undefined) {
            reserve0 = Number(poolData.reserve0);
            dataSource = 'reserve0';
          }

          if (reserve1 === 0 && poolData.reserve1 !== undefined) {
            reserve1 = Number(poolData.reserve1);
            dataSource = 'reserve1';
          }

          // 3. balance 배열에서 확인 (가장 낮은 우선순위)
          if (
            (reserve0 === 0 || reserve1 === 0) &&
            poolData.balance &&
            Array.isArray(poolData.balance)
          ) {
            try {
              if (reserve0 === 0 && poolData.balance[0] !== undefined) {
                reserve0 = Number(poolData.balance[0]);
                dataSource = 'balance[0]';
              }
              if (reserve1 === 0 && poolData.balance[1] !== undefined) {
                reserve1 = Number(poolData.balance[1]);
                dataSource = 'balance[1]';
              }
            } catch (e) {
              console.error('[getPoolInfo] Error parsing balance array:', e);
            }
          }

          // 필수 필드 유효성 검사
          const lpTokenId = extractId(poolData.lpToken || poolData.lp_token);

          if (lpTokenId === 0) {
            console.warn('[getPoolInfo] LP token ID is zero, potential data issue');
          }

          // 수수료 등급 정보
          const feeTier = poolData.feeTier
            ? Number(poolData.feeTier)
            : poolData.fee_tier
              ? Number(poolData.fee_tier)
              : 0;

          const result: PoolInfo = {
            baseAssetId,
            quoteAssetId,
            reserve0,
            reserve1,
            lpTokenId,
            feeTier,
            poolExists: true,
            poolIndex,
          };
          poolInfoCache.current.set(poolIndex, result);
          console.log('[PoolDataStore] getPoolInfo 결과:', {
            poolIndex,
            poolInfoData: result,
          });
          return result;
        } catch (error) {
          console.error('[getPoolInfo] Error getting pool info:', error);
          // 오류 발생 시 기본 구조 반환
          return {
            baseAssetId: 0,
            quoteAssetId: 0,
            reserve0: 0,
            reserve1: 0,
            lpTokenId: 0,
            feeTier: 0,
            poolExists: false,
          };
        }
      });
    },
    [api, isConnected, isReady],
  );

  /**
   * 토큰 페어로 풀 정보를 조회하는 함수 (기존 인터페이스와의 호환성 유지)
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @returns 풀 정보
   */
  const getPoolInfoByPair = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<PoolInfo> => {
      return withApiReady(api, isConnected, isReady, async () => {
        if (!api) throw new Error('API not connected');

        try {
          // 페어를 이용하여 풀 인덱스 찾기
          const poolIndex = await findPoolIndexByPair(baseAssetId, quoteAssetId);
          console.log('[PoolDataStore] findPoolIndexByPair 반환값:', poolIndex);

          if (poolIndex === null) {
            return {
              baseAssetId,
              quoteAssetId,
              reserve0: 0,
              reserve1: 0,
              lpTokenId: 0,
              feeTier: 0,
              poolExists: false,
            };
          }

          // 찾은 인덱스로 풀 정보 조회
          const poolInfo = await getPoolInfo(poolIndex);
          console.log('[PoolDataStore] getPoolInfo 결과:', {
            poolIndex,
            poolInfoData: poolInfo,
          });

          if (!poolInfo || !poolInfo.poolExists || poolInfo.reserve0 === 0) {
            return {
              baseAssetId,
              quoteAssetId,
              reserve0: 0,
              reserve1: 0,
              lpTokenId: 0,
              feeTier: 0,
              poolExists: false,
            };
          }
          // 단위 변환하여 가격 비율 계산 (reserve1/10^decimals1)/(reserve0/10^decimals0)
          const baseMetadata = await api.query.assets.metadata(baseAssetId);
          const quoteMetadata = await api.query.assets.metadata(quoteAssetId);
          const normalizedReserve0 =
            poolInfo.reserve0 / Math.pow(10, extractDecimals(baseMetadata.toHuman()));
          const normalizedReserve1 =
            poolInfo.reserve1 / Math.pow(10, extractDecimals(quoteMetadata.toHuman()));

          if (normalizedReserve0 === 0) {
            return 1;
          }

          const ratio = normalizedReserve1 / normalizedReserve0;
          return {
            baseAssetId,
            quoteAssetId,
            reserve0: poolInfo.reserve0,
            reserve1: poolInfo.reserve1,
            lpTokenId: poolInfo.lpTokenId,
            feeTier: poolInfo.feeTier,
            poolExists: true,
            poolIndex,
          };
        } catch (error) {
          console.error('[getPoolInfoByPair] Error getting pool info by pair:', error);
          return {
            baseAssetId,
            quoteAssetId,
            reserve0: 0,
            reserve1: 0,
            lpTokenId: 0,
            feeTier: 0,
            poolExists: false,
          };
        }
      });
    },
    [api, isConnected, isReady, findPoolIndexByPair, getPoolInfo],
  );

  /**
   * 토큰 쌍의 가격 비율 계산
   * @param token0Id 첫 번째 토큰 ID
   * @param token1Id 두 번째 토큰 ID
   * @returns 가격 비율 (price1 / price0), 오류 시 1을 기본값으로 반환
   */
  const getPoolPriceRatio = useCallback(
    async (token0Id: number | string, token1Id: number | string): Promise<number> => {
      return withApiReady(api, isConnected, isReady, async () => {
        // 방어적 코딩: ID가 유효한 숫자인지 확인
        const id0 = Number(token0Id);
        const id1 = Number(token1Id);

        if (!api) throw new Error('API not connected');
        if (isNaN(id0) || isNaN(id1)) {
          console.error('[getPoolPriceRatio] Invalid token IDs:', token0Id, token1Id);
          return 1; // 오류 시 기본값
        }

        try {
          // 토큰 소수점 정보 가져오기 (항상 필요함)
          const meta0 = await api.query.assets.metadata(id0);
          const meta1 = await api.query.assets.metadata(id1);
          const humanMeta0 = meta0.toHuman();
          const humanMeta1 = meta1.toHuman();

          // utils의 extractDecimals 함수 사용
          const decimals0 = extractDecimals(humanMeta0);
          const decimals1 = extractDecimals(humanMeta1);

          // 페어로 풀 정보 찾기
          const poolIndex = await findPoolIndexByPair(id0, id1);

          // 풀이 없는 경우 (신규 풀 생성 등의 경우)
          if (poolIndex === null) {
            return 1; // 풀을 찾지 못했을 때 기본값
          }

          // 풀 인덱스로 풀 정보 조회
          const poolInfo = await getPoolInfo(poolIndex);

          if (!poolInfo || !poolInfo.poolExists || poolInfo.reserve0 === 0) {
            return 1; // 풀 정보가 없거나 유효하지 않을 때 기본값
          }
          // 단위 변환하여 가격 비율 계산 (reserve1/10^decimals1)/(reserve0/10^decimals0)
          const baseMetadata = await api.query.assets.metadata(id0);
          const quoteMetadata = await api.query.assets.metadata(id1);
          const normalizedReserve0 =
            poolInfo.reserve0 / Math.pow(10, extractDecimals(baseMetadata.toHuman()));
          const normalizedReserve1 =
            poolInfo.reserve1 / Math.pow(10, extractDecimals(quoteMetadata.toHuman()));

          if (normalizedReserve0 === 0) {
            return 1;
          }

          const ratio = normalizedReserve1 / normalizedReserve0;
          return ratio;
        } catch (error) {
          console.error('[getPoolPriceRatio] Price ratio fetch error:', error);
          return 1; // 오류 발생 시 기본값
        }
      });
    },
    [api, isConnected, isReady, findPoolIndexByPair, getPoolInfo],
  );

  /**
   * Runtime call을 사용하여 풀 데이터를 조회하는 함수
   * @param poolId 조회할 풀 ID
   * @returns 풀 데이터 객체
   */
  const getPoolQueryRpc = useCallback(
    async (baseAssetId: number, quoteAssetId: number) => {
      return withApiReady(api, isConnected, isReady, async () => {
        if (!api) throw new Error('API not connected');

        try {
          const base = api.createType('FrameSupportTokensFungibleUnionOfNativeOrWithId', {
            WithId: baseAssetId,
          });
          const quote = api.createType('FrameSupportTokensFungibleUnionOfNativeOrWithId', {
            WithId: quoteAssetId,
          });

          const result = await (api.call as any).hybridOrderbookApi.getPoolQuery(
            base,
            quote,
          );

          return {
            baseAssetId,
            quoteAssetId,
            data: result.toHuman(),
            success: true,
          };
        } catch (error) {
          console.error('[getPoolQueryRpc] Error fetching pool data:', error);
          return {
            baseAssetId,
            quoteAssetId,
            data: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });
    },
    [api, isConnected, isReady],
  );

  /**
   * 오더북 데이터를 RPC로 가져오는 함수
   */
  const getOrderbookData = useCallback(
    async (baseAssetId: number, quoteAssetId: number) => {
      if (!api) return { asks: null, bids: null };

      try {
        // 직접 getPoolQueryRpc 호출
        const poolQueryResult = await getPoolQueryRpc(baseAssetId, quoteAssetId);

        if (!poolQueryResult.success || !poolQueryResult.data) {
          console.error('[getOrderbookData] getPoolQuery 실패:', poolQueryResult);
          return { asks: null, bids: null };
        }

        const poolData = poolQueryResult.data;

        // 오더북 데이터 추출 - 직접 poolData에서 asks와 bids 찾기
        const asks = poolData.asks || null;
        const bids = poolData.bids || null;

        if (asks || bids) {
          return { asks, bids };
        }

        // 혹시 orderbook 객체 안에 있을 경우도 확인
        if (poolData.orderbook) {
          const nestedAsks = poolData.orderbook.asks || null;
          const nestedBids = poolData.orderbook.bids || null;

          if (nestedAsks || nestedBids) {
            return { asks: nestedAsks, bids: nestedBids };
          }
        }

        console.error('[getOrderbookData] 오더북 데이터를 찾을 수 없습니다');
        return { asks: null, bids: null };
      } catch (error) {
        console.error('[getOrderbookData] 오더북 데이터 가져오기 실패:', error);
        return { asks: null, bids: null };
      }
    },
    [api, getPoolQueryRpc],
  );

  /**
   * 오더북에 구독하는 함수
   * @param api Polkadot.js API 인스턴스
   * @param baseAssetId 기본 자산 ID
   * @param quoteAssetId 쿼트 자산 ID
   * @param onUpdate 업데이트 콜백
   * @returns 구독 해제 함수들
   */
  const subscribeToOrderbook = useCallback(
    async (
      api: any,
      baseAssetId: number,
      quoteAssetId: number,
      onUpdate: (data: any) => void,
    ) => {
      if (!api) throw new Error('API not connected');

      // 1. 캐시에서 풀 인덱스 확인
      const key = `${baseAssetId}-${quoteAssetId}`;
      let poolIndex = poolIndexCache.current.get(key);

      if (poolIndex === undefined) {
        poolIndex = await findPoolIndexByPair(baseAssetId, quoteAssetId);
        poolIndexCache.current.set(key, poolIndex);
      }

      if (poolIndex === null) throw new Error('Pool not found');

      // 2. 폴링 함수
      const fetchOrderbookData = async () => {
        try {
          const orderbookData = await getOrderbookData(baseAssetId, quoteAssetId);
          if (orderbookData) {
            if (orderbookData.asks) onUpdate({ asks: orderbookData.asks });
            if (orderbookData.bids) onUpdate({ bids: orderbookData.bids });
          }
        } catch (err) {
          console.error('[subscribeToOrderbook] 오더북 폴링 오류:', err);
        }
      };

      await fetchOrderbookData();
      const interval = setInterval(fetchOrderbookData, 5000);

      return {
        unsubscribe: () => clearInterval(interval),
      };
    },
    [findPoolIndexByPair, getOrderbookData],
  );

  const getPoolMetadata = useCallback(
    async (baseAssetId: number, quoteAssetId: number) => {
      const key = `${baseAssetId}-${quoteAssetId}`;
      if (poolMetadataCache.current.has(key)) {
        return poolMetadataCache.current.get(key);
      }
      return withApiReady(api, isConnected, isReady, async () => {
        if (!api) throw new Error('API not connected');
        try {
          const base = api.createType('FrameSupportTokensFungibleUnionOfNativeOrWithId', {
            WithId: baseAssetId,
          });
          const quote = api.createType('FrameSupportTokensFungibleUnionOfNativeOrWithId', {
            WithId: quoteAssetId,
          });
          const result = await (api.call as any).hybridOrderbookApi.getPoolMetadata(
            base,
            quote,
          );
          const metadata = result.toHuman();
          poolMetadataCache.current.set(key, metadata);
          return metadata;
        } catch (error) {
          console.error('[getPoolMetadata] Error fetching pool metadata:', error);
          return null;
        }
      });
    },
    [api, isConnected, isReady],
  );

  // return 문에 추가
  return {
    findPoolIndexByPair,
    getPoolInfo,
    getPoolInfoByPair,
    getPoolPriceRatio,
    getPoolQueryRpc,
    subscribeToOrderbook,
    getOrderbookData,
    getPoolMetadata,
  };
};
