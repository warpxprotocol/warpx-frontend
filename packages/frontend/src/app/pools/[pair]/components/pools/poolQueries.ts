import { useCallback } from 'react';

import { useApi } from '@/hooks/useApi';

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

/**
 * 풀 조회 관련 함수들을 제공하는 훅
 */
export const usePoolQueries = () => {
  const { api } = useApi();

  /**
   * 토큰 페어로 풀 인덱스를 찾는 함수
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @returns 풀 인덱스 (찾지 못한 경우 null)
   */
  const findPoolIndexByPair = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<number | null> => {
      if (!api) throw new Error('API not connected');

      try {
        const poolsData = await api.query.hybridOrderbook.pools.entries();
        console.log(
          '[findPoolIndexByPair] 검색 시작: baseAssetId =',
          baseAssetId,
          'quoteAssetId =',
          quoteAssetId,
        );
        console.log(
          '[findPoolIndexByPair] 총',
          poolsData.length,
          '개의 풀 데이터를 조회함',
        );

        // Make sure baseAssetId and quoteAssetId are valid numbers
        const id0 = Number(baseAssetId);
        const id1 = Number(quoteAssetId);

        if (isNaN(id0) || isNaN(id1)) {
          console.error('[findPoolIndexByPair] Invalid IDs:', baseAssetId, quoteAssetId);
          return null;
        }

        for (const entry of poolsData as any[]) {
          const key = entry[0];
          const value = entry[1];
          const valueHuman =
            typeof value.toHuman === 'function' ? value.toHuman() : undefined;

          // 키에서 풀 인덱스 추출 - 더 방어적인 로직으로 강화
          let poolIndex;
          try {
            if (!key.args || !key.args[0]) {
              console.log('[findPoolIndexByPair] key.args[0] is undefined or null');
              poolIndex = NaN;
            } else if (key.args[0].toNumber && typeof key.args[0].toNumber === 'function') {
              poolIndex = key.args[0].toNumber();
            } else if (typeof key.args[0] === 'object' && 'valueOf' in key.args[0]) {
              poolIndex = Number(key.args[0].valueOf());
            } else {
              poolIndex = Number(key.args[0]);
            }

            if (isNaN(poolIndex)) {
              console.log(
                '[findPoolIndexByPair] Failed to extract valid pool index from:',
                key.args[0],
              );
            }
          } catch (e) {
            console.error('[findPoolIndexByPair] Error extracting pool index:', e);
            poolIndex = NaN;
          }

          // 키 구조 자세히 로깅
          const keyHuman = key.toHuman ? key.toHuman() : null;
          console.log(
            '[findPoolIndexByPair] 풀 인덱스:',
            poolIndex,
            '키 구조:',
            JSON.stringify(keyHuman),
          );

          if (keyHuman) {
            console.log('[findPoolIndexByPair] 키 구조 타입:', typeof keyHuman);
            if (Array.isArray(keyHuman)) {
              console.log('[findPoolIndexByPair] 키 배열 길이:', keyHuman.length);
              if (keyHuman.length > 1) {
                console.log('[findPoolIndexByPair] 두 번째 요소 타입:', typeof keyHuman[1]);
                console.log(
                  '[findPoolIndexByPair] 두 번째 요소 값:',
                  JSON.stringify(keyHuman[1]),
                );
              }
            }
          }

          let poolBaseAssetId: number | null = null;
          let poolQuoteAssetId: number | null = null;

          // 1. 키 구조 방식 1: [Array(2)]에서 두 번째 배열에 WithId 객체 배열로 저장됨
          if (keyHuman && Array.isArray(keyHuman) && keyHuman.length > 1) {
            const assetPair = keyHuman[1]; // 두 번째 요소가 자산 쌍

            if (Array.isArray(assetPair) && assetPair.length >= 2) {
              // WithId 객체에서 ID 추출
              poolBaseAssetId = extractId(assetPair[0]);
              poolQuoteAssetId = extractId(assetPair[1]);

              console.log(
                '[findPoolIndexByPair] 키 구조 방식 1: 풀 인덱스:',
                poolIndex,
                'assets:',
                poolBaseAssetId,
                poolQuoteAssetId,
              );
            }
          }

          // 2. 키 구조 방식 2: keyHuman에 직접 assets 배열이 있는 경우
          if (poolBaseAssetId === null && keyHuman && typeof keyHuman === 'object') {
            for (const prop in keyHuman) {
              if (Array.isArray(keyHuman[prop]) && keyHuman[prop].length >= 2) {
                try {
                  poolBaseAssetId = extractId(keyHuman[prop][0]);
                  poolQuoteAssetId = extractId(keyHuman[prop][1]);
                  console.log(
                    '[findPoolIndexByPair] 키 구조 방식 2: 풀 인덱스:',
                    poolIndex,
                    'assets:',
                    poolBaseAssetId,
                    poolQuoteAssetId,
                  );
                } catch (e) {
                  console.log('[findPoolIndexByPair] 키 구조 방식 2 처리 중 오류:', e);
                }
              }
            }
          }

          // 3. 값에서도 추출 시도 (백업 메소드)
          if ((poolBaseAssetId === null || poolQuoteAssetId === null) && valueHuman) {
            const baseFromValue = extractId(
              valueHuman.baseAssetId || valueHuman.base_asset_id,
            );
            const quoteFromValue = extractId(
              valueHuman.quoteAssetId || valueHuman.quote_asset_id,
            );

            if (baseFromValue && quoteFromValue) {
              poolBaseAssetId = baseFromValue;
              poolQuoteAssetId = quoteFromValue;
              console.log(
                '[findPoolIndexByPair] 값 구조에서 ID 추출: 풀 인덱스:',
                poolIndex,
                'assets:',
                poolBaseAssetId,
                poolQuoteAssetId,
              );
            }
          }

          // 4. key.args[1]에 직접 접근해보기 (raw 데이터)
          if (
            (poolBaseAssetId === null || poolQuoteAssetId === null) &&
            key.args &&
            key.args.length > 1
          ) {
            try {
              const rawArgs = key.args[1];
              console.log('[findPoolIndexByPair] Raw key.args[1]:', typeof rawArgs);

              // 패턴별로 자산 ID 추출 시도
              if (typeof rawArgs === 'object' && rawArgs !== null) {
                // 일반적인 객체인 경우
                if (rawArgs.toHuman) {
                  const rawArgsHuman = rawArgs.toHuman();
                  console.log(
                    '[findPoolIndexByPair] Raw key.args[1].toHuman():',
                    JSON.stringify(rawArgsHuman),
                  );

                  if (Array.isArray(rawArgsHuman) && rawArgsHuman.length >= 2) {
                    poolBaseAssetId = extractId(rawArgsHuman[0]);
                    poolQuoteAssetId = extractId(rawArgsHuman[1]);
                  }
                }
                // 배열인 경우
                else if (Array.isArray(rawArgs) && rawArgs.length >= 2) {
                  poolBaseAssetId = extractId(
                    rawArgs[0].toHuman ? rawArgs[0].toHuman() : rawArgs[0],
                  );
                  poolQuoteAssetId = extractId(
                    rawArgs[1].toHuman ? rawArgs[1].toHuman() : rawArgs[1],
                  );
                }

                if (poolBaseAssetId !== null && poolQuoteAssetId !== null) {
                  console.log(
                    '[findPoolIndexByPair] Raw args에서 추출: 풀 인덱스:',
                    poolIndex,
                    'assets:',
                    poolBaseAssetId,
                    poolQuoteAssetId,
                  );
                }
              }
            } catch (e) {
              console.log('[findPoolIndexByPair] Raw args 처리 중 오류:', e);
            }
          }

          // 자산 ID 매칭 시도 (순서 상관없이)
          if (
            poolBaseAssetId !== null &&
            poolQuoteAssetId !== null &&
            ((poolBaseAssetId === id0 && poolQuoteAssetId === id1) ||
              (poolBaseAssetId === id1 && poolQuoteAssetId === id0))
          ) {
            // NaN 인덱스 체크
            if (isNaN(poolIndex)) {
              console.log(
                '[findPoolIndexByPair] Found matching pool but index is NaN, continuing search',
              );
              continue; // Skip this entry and continue searching
            }

            console.log('[findPoolIndexByPair] 매칭되는 풀 찾음! 인덱스:', poolIndex);
            return poolIndex;
          }
        }

        console.log('[findPoolIndexByPair] 매칭되는 풀을 찾지 못함:', id0, id1);
        return null; // 페어에 대한 풀을 찾지 못함
      } catch (error) {
        console.error('[findPoolIndexByPair] Error finding pool index:', error);
        return null;
      }
    },
    [api],
  );

  /**
   * 풀 인덱스를 이용하여 풀 정보 조회 함수
   * @param poolIndex 풀 인덱스
   * @returns 풀 정보
   */
  const getPoolInfo = useCallback(
    async (poolIndex: number): Promise<PoolInfo> => {
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
        console.log('[getPoolInfo] Querying pool with index:', poolIndex);

        // 풀 인덱스로 직접 쿼리
        const poolRawData = await api.query.hybridOrderbook.pools(poolIndex);
        const valueHuman = poolRawData.toHuman();

        console.log('[getPoolInfo] Pool data:', JSON.stringify(valueHuman, null, 2));

        if (!valueHuman || Object.keys(valueHuman).length === 0) {
          throw new Error(`Pool with index ${poolIndex} not found`);
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

        console.log(
          `[getPoolInfo] Pool reserves: ${reserve0}, ${reserve1} (source: ${dataSource})`,
        );

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

        return {
          baseAssetId,
          quoteAssetId,
          reserve0,
          reserve1,
          lpTokenId,
          feeTier,
          poolExists: true,
          poolIndex,
        };
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
    },
    [api],
  );

  /**
   * 토큰 페어로 풀 정보를 조회하는 함수 (기존 인터페이스와의 호환성 유지)
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @returns 풀 정보
   */
  const getPoolInfoByPair = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<PoolInfo> => {
      if (!api) throw new Error('API not connected');

      try {
        // 페어를 이용하여 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseAssetId, quoteAssetId);

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
        return await getPoolInfo(poolIndex);
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
    },
    [api, findPoolIndexByPair, getPoolInfo],
  );

  /**
   * 토큰 쌍의 가격 비율 계산
   * @param token0Id 첫 번째 토큰 ID
   * @param token1Id 두 번째 토큰 ID
   * @returns 가격 비율 (price1 / price0), 오류 시 1을 기본값으로 반환
   */
  const getPoolPriceRatio = useCallback(
    async (token0Id: number | string, token1Id: number | string): Promise<number> => {
      // 방어적 코딩: ID가 유효한 숫자인지 확인
      const id0 = Number(token0Id);
      const id1 = Number(token1Id);

      if (!api) throw new Error('API not connected');
      if (isNaN(id0) || isNaN(id1)) {
        console.error('[getPoolPriceRatio] Invalid token IDs:', token0Id, token1Id);
        return 1; // 오류 시 기본값
      }

      try {
        console.log('[getPoolPriceRatio] token0Id:', id0, 'token1Id:', id1);

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
          console.log(
            '[getPoolPriceRatio] Pool not found for token pair:',
            id0,
            id1,
            '- Using default ratio of 1',
          );
          return 1; // 풀을 찾지 못했을 때 기본값
        }

        // 풀 인덱스로 풀 정보 조회
        const poolInfo = await getPoolInfo(poolIndex);

        if (!poolInfo || !poolInfo.poolExists || poolInfo.reserve0 === 0) {
          console.log(
            '[getPoolPriceRatio] Pool exists but no reserves or invalid data - Using default ratio of 1',
          );
          return 1; // 풀 정보가 없거나 유효하지 않을 때 기본값
        }

        console.log(
          '[getPoolPriceRatio] Decimals:',
          decimals0,
          decimals1,
          'Reserves:',
          poolInfo.reserve0,
          poolInfo.reserve1,
        );

        // 단위 변환하여 가격 비율 계산 (reserve1/10^decimals1)/(reserve0/10^decimals0)
        const normalizedReserve0 = poolInfo.reserve0 / Math.pow(10, decimals0);
        const normalizedReserve1 = poolInfo.reserve1 / Math.pow(10, decimals1);

        if (normalizedReserve0 === 0) {
          console.log(
            '[getPoolPriceRatio] Zero normalized reserve for token0, returning default ratio',
          );
          return 1;
        }

        const ratio = normalizedReserve1 / normalizedReserve0;
        console.log('[getPoolPriceRatio] Calculated ratio:', ratio);
        return ratio;
      } catch (error) {
        console.error('[getPoolPriceRatio] Price ratio fetch error:', error);
        return 1; // 오류 발생 시 기본값
      }
    },
    [api, findPoolIndexByPair, getPoolInfo],
  );

  // 내부 함수는 utils.ts의 extractDecimals로 대체합니다.

  return {
    findPoolIndexByPair,
    getPoolInfo,
    getPoolInfoByPair,
    getPoolPriceRatio,
  };
};
