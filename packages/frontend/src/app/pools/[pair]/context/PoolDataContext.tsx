'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';

import { useApi } from '@/hooks/useApi';
import { isApiReady } from '@/hooks/useApi';

import { PoolInfo } from '../components/pools/poolQueries';
import { usePoolQueries } from '../components/pools/poolQueries';
import { extractDecimals, extractId } from '../components/pools/utils';

// PoolInfoDisplay 인터페이스
export interface PoolInfoDisplay extends PoolInfo {
  baseAssetSymbol?: string;
  quoteAssetSymbol?: string;
  baseAssetDecimals?: number;
  quoteAssetDecimals?: number;
  lpTokenSymbol?: string;
  lpTokenDecimals?: number;
  poolDecimals?: number;
  poolPrice?: number;
  lotSize?: number;
  // 오더북 데이터
  asks?: any;
  bids?: any;
  tickSize?: number;

  // 원본 데이터
  rawData?: any;

  takerFeeRate?: number;
  poolMetadata?: any; // 원본 메타데이터 전체
  poolQueryRaw?: any; // 원본 쿼리 전체
}

// Zustand 스토어 상태 정의
interface PoolDataState {
  // 데이터 상태
  poolInfo: PoolInfoDisplay | null;
  loading: boolean;
  error: string | null;

  // 액션
  setPoolInfo: (poolInfo: PoolInfoDisplay | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshPoolData: () => void;

  // 구독 상태
  isSubscribed: boolean;
  setSubscribed: (isSubscribed: boolean) => void;

  // 메타데이터 상태
  metadata: {
    baseSymbol?: string;
    quoteSymbol?: string;
    baseDecimals?: number;
    quoteDecimals?: number;
    feeRate?: number;
    lotSize?: number;
    tickSize?: number;
    poolDecimals?: number;
  } | null;
  setMetadata: (meta: PoolDataState['metadata']) => void;
}

// 스토어 생성
export const usePoolDataStore = create<PoolDataState>((set) => ({
  poolInfo: null,
  loading: true,
  error: null,
  isSubscribed: false,
  metadata: null,

  setPoolInfo: (poolInfo) => set({ poolInfo }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  refreshPoolData: () => {
    set({ loading: true, error: null });
  },
  setSubscribed: (isSubscribed) => set({ isSubscribed }),
  setMetadata: (meta) => set({ metadata: meta }),
}));

// 셀렉터 함수들
export const selectPoolInfo = (state: PoolDataState) => state.poolInfo;
export const selectLoading = (state: PoolDataState) => state.loading;
export const selectError = (state: PoolDataState) => state.error;
export const selectIsSubscribed = (state: PoolDataState) => state.isSubscribed;

// API 상태 로깅 함수
const logApiStatus = (api: any) => {
  if (!api) return 'API is null';
  return {
    isReady: api.isReady ? 'ready' : 'not ready',
    isConnected: api.isConnected ? 'connected' : 'not connected',
  };
};

// 1. shallowEqual 함수 추가
function shallowEqual(objA: any, objB: any) {
  if (objA === objB) return true;
  if (!objA || !objB) return false;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let key of keysA) {
    if (objA[key] !== objB[key]) return false;
  }
  return true;
}

// 2. setPoolInfo 최적화
const setPoolInfo = (poolInfo: PoolInfoDisplay | null) => {
  usePoolDataStore.setState((state) => {
    if (shallowEqual(state.poolInfo, poolInfo)) return state;
    return { ...state, poolInfo };
  });
};

// 예시: 심볼 → asset id 매핑
const symbolToId: Record<string, number> = {
  DOT: 1,
  USDT: 2,
  // ... 추가
};

// 풀 데이터 로직을 위한 훅
export function usePoolDataFetcher() {
  const { api, isConnected, isReady } = useApi();
  const params = useParams();
  const searchParams = useSearchParams();
  const isFetchingRef = useRef(false);
  const poolInfoRef = useRef<PoolInfoDisplay | null>(null);
  const poolIndexRef = useRef<number | null>(null);

  // URL에서 토큰 ID 추출
  const pairString = params?.pair?.toString() || '';
  // console.log('원본 pair 문자열:', pairString);

  // 각 부분에서 숫자 추출 시도
  const extractTokenId = (part: string): number | null => {
    // 괄호 안의 숫자 패턴: WO(1)
    const bracketMatch = part.match(/\((\d+)\)/);
    if (bracketMatch) return parseInt(bracketMatch[1], 10);

    // 단순 숫자 패턴: 1
    const numMatch = part.match(/^(\d+)$/);
    if (numMatch) return parseInt(numMatch[1], 10);

    return null;
  };

  // 1. 쿼리 파라미터에서 추출 (baseId, quoteId)
  let baseId = searchParams?.get('baseId');
  let quoteId = searchParams?.get('quoteId');

  if (baseId && quoteId) {
    baseId = String(parseInt(baseId, 10));
    quoteId = String(parseInt(quoteId, 10));
  } else {
    // 2. 쿼리 파라미터가 없으면 URL 경로에서 추출 시도
    if (pairString) {
      // URL 디코딩 (WO%2FWF -> WO/WF)
      const decodedPair = decodeURIComponent(pairString);
      // console.log('디코딩된 pair 문자열:', decodedPair);

      // 분리자로 분리 시도 (예: WO/WF, WO-WF)
      const pairParts =
        decodedPair.split('/').length === 2
          ? decodedPair.split('/')
          : decodedPair.split('-').length === 2
            ? decodedPair.split('-')
            : [];

      // console.log('분리된 pair 부분:', pairParts);

      // 유효한 쌍이 있으면 각 부분에서 ID 추출
      if (pairParts.length === 2) {
        if (!baseId) {
          const extractedBaseId = extractTokenId(pairParts[0]);
          if (extractedBaseId !== null) {
            baseId = String(extractedBaseId);
          }
        }

        if (!quoteId) {
          const extractedQuoteId = extractTokenId(pairParts[1]);
          if (extractedQuoteId !== null) {
            quoteId = String(extractedQuoteId);
          }
        }
      }

      // 예시: 심볼 → asset id 매핑
      if (!baseId && pairParts.length === 2) {
        const symbol = pairParts[0];
        if (symbolToId[symbol]) {
          baseId = String(symbolToId[symbol]);
        }
      }
      if (!quoteId && pairParts.length === 2) {
        const symbol = pairParts[1];
        if (symbolToId[symbol]) {
          quoteId = String(symbolToId[symbol]);
        }
      }
    }
  }

  // 최종 변환
  const baseIdFromUrl = baseId ? parseInt(baseId, 10) : NaN;
  const quoteIdFromUrl = quoteId ? parseInt(quoteId, 10) : NaN;

  // console.log('최종 추출된 토큰 ID:', {
  //   baseId: baseIdFromUrl,
  //   quoteId: quoteIdFromUrl,
  //   originalPath: pairString,
  // });

  // 풀 쿼리 함수들
  const { getPoolQueryRpc, findPoolIndexByPair, getPoolMetadata } = usePoolQueries();

  // 개별 액션을 직접 선택하여 객체 생성을 방지
  const setLoading = usePoolDataStore((state) => state.setLoading);
  const setError = usePoolDataStore((state) => state.setError);
  const refreshPoolData = usePoolDataStore((state) => state.refreshPoolData);
  const setSubscribed = usePoolDataStore((state) => state.setSubscribed);
  const setPoolInfo = usePoolDataStore((state) => state.setPoolInfo);
  const setMetadata = usePoolDataStore((state) => state.setMetadata);

  // 구독 해제를 안전하게 처리하는 유틸리티 함수
  const safeUnsubscribe = useCallback((fn?: () => void) => {
    if (typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        // 에러만 출력
        if (process.env.NODE_ENV === 'development') {
          console.error('[Unsubscribe] 구독 해제 실패:', err);
        }
      }
    }
  }, []);

  // 구독 관리 Refs
  const subscriptionsRef = useRef<{
    pool?: any; // Polkadot.js unsubscribe function can be various types
    orderbook?: any; // Combination of unsubscribe functions
    trades?: any; // Polkadot.js unsubscribe function
    metadataInterval?: NodeJS.Timeout;
  }>({});

  // 모든 구독 해제 함수
  const unsubscribeAll = useCallback(() => {
    // console.log('[PoolDataStore] 모든 구독 해제 중');

    // 풀 구독 해제
    if (subscriptionsRef.current.pool) {
      try {
        const unsubFn = subscriptionsRef.current.pool;
        if (typeof unsubFn === 'function') {
          unsubFn();
          // console.log('[PoolSubscription] 풀 구독 해제 완료');
        } else {
          // console.log(
          //   '[PoolSubscription] 풀 구독 해제 함수가 유효하지 않음:',
          //   typeof unsubFn,
          // );
        }
        subscriptionsRef.current.pool = undefined;
      } catch (err) {
        // console.error('[PoolSubscription] 풀 구독 해제 오류:', err);
      }
    }

    // 오더북 구독 해제
    if (subscriptionsRef.current.orderbook) {
      try {
        const unsubFn = subscriptionsRef.current.orderbook;
        if (typeof unsubFn === 'function') {
          unsubFn();
          // console.log('[OrderbookSubscription] 오더북 구독 해제 완료');
        }
        subscriptionsRef.current.orderbook = undefined;
      } catch (err) {
        // console.error('[OrderbookSubscription] 오더북 구독 해제 오류:', err);
      }
    }

    // 거래 구독 해제
    if (subscriptionsRef.current.trades) {
      try {
        const unsubFn = subscriptionsRef.current.trades;
        if (typeof unsubFn === 'function') {
          unsubFn();
          // console.log('[TradesSubscription] 거래 구독 해제 완료');
        }
        subscriptionsRef.current.trades = undefined;
      } catch (err) {
        // console.error('[TradesSubscription] 거래 구독 해제 오류:', err);
      }
    }

    // 메타데이터 폴링 해제
    if (subscriptionsRef.current.metadataInterval) {
      clearInterval(subscriptionsRef.current.metadataInterval);
      subscriptionsRef.current.metadataInterval = undefined;
      // console.log('[TokenPolling] 메타데이터 폴링 해제 완료');
    }

    // 구독 상태 업데이트
    setSubscribed(false);
    // console.log('[Subscriptions] 모든 구독 해제 완료');
  }, [setSubscribed]);

  // 오더북 구독 해제 헬퍼 함수
  const combinedOrderbookUnsubscribe = useCallback(
    (unsubAsks?: () => void, unsubBids?: () => void) => {
      try {
        safeUnsubscribe(unsubAsks);
        safeUnsubscribe(unsubBids);
      } catch (err) {
        // console.error('[OrderbookSubscription] 구독 해제 중 오류', err);
      }
    },
    [safeUnsubscribe],
  );

  // 중요 키만 추출하여 간단한 해시 생성 (성능 최적화)
  function createLightHash(data: any): string {
    if (!data || !data.leaves) return 'empty';

    try {
      // leaves의 키만 추출하여 간단한 해시 생성 (더 빠름)
      const leafKeys = Object.keys(data.leaves).sort().join('|');
      // 전체 주문수만 포함 (변경 감지용)
      const orderCount = Object.values(data.leaves).reduce((count: number, leaf: any) => {
        return count + Object.keys(leaf.value?.openOrders || {}).length;
      }, 0);

      return `${leafKeys}:${orderCount}`;
    } catch (e) {
      return `error:${Date.now()}`;
    }
  }

  // 토큰 메타데이터 업데이트 함수
  const updateTokenMetadata = useCallback(async () => {
    if (!api || !baseIdFromUrl || !quoteIdFromUrl) return;

    try {
      const [baseMeta, quoteMeta] = await Promise.all([
        api.query.assets.metadata(baseIdFromUrl),
        api.query.assets.metadata(quoteIdFromUrl),
      ]);

      const baseDecimals = extractDecimals(baseMeta?.toHuman());
      const quoteDecimals = extractDecimals(quoteMeta?.toHuman());

      const currentPoolInfo = usePoolDataStore.getState().poolInfo;
      if (!currentPoolInfo) return;

      const updatedPoolInfo = {
        ...currentPoolInfo,
        baseAssetDecimals: baseDecimals,
        quoteAssetDecimals: quoteDecimals,
        poolPrice: currentPoolInfo.poolPrice,
        reserve0: currentPoolInfo.reserve0,
        reserve1: currentPoolInfo.reserve1,
      };

      // Ref와 상태 모두 업데이트
      poolInfoRef.current = updatedPoolInfo;
      setPoolInfo(updatedPoolInfo);

      // console.log('[TokenPolling] 토큰 메타데이터 업데이트 완료');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TokenPolling] 메타데이터 업데이트 실패:', err);
      }
    }
  }, [api, baseIdFromUrl, quoteIdFromUrl, setPoolInfo]);

  // 메타데이터 fetch 함수
  const fetchMetadata = useCallback(async () => {
    if (!api || !baseIdFromUrl || !quoteIdFromUrl) return;

    // 토큰 메타데이터
    const [baseMeta, quoteMeta] = await Promise.all([
      api.query.assets.metadata(baseIdFromUrl),
      api.query.assets.metadata(quoteIdFromUrl),
    ]);

    // 풀 메타데이터 (여기서 feeRate 등 추출)
    const poolMeta = await getPoolMetadata(baseIdFromUrl, quoteIdFromUrl);

    setMetadata({
      baseDecimals: poolMeta.baseDecimals,
      quoteDecimals: poolMeta.quoteDecimals,
      feeRate: extractFeeRate(poolMeta),
      lotSize: poolMeta.lotSize,
      tickSize: poolMeta.tickSize,
      poolDecimals: poolMeta.poolDecimals,
    });
  }, [api, baseIdFromUrl, quoteIdFromUrl, setMetadata, getPoolMetadata]);

  // 최초 1회만 메타데이터 fetch
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (retryCount = 0, maxRetries = 3) => {
      if (isFetchingRef.current) {
        console.log('[PoolDataStore] 이미 데이터를 가져오는 중입니다.');
        return;
      }
      isFetchingRef.current = true;

      try {
        if (!isApiReady(api, isConnected, isReady)) {
          console.log(
            `[PoolDataStore] API가 준비되지 않음, 재시도 ${retryCount}/${maxRetries}`,
            'API 상태:',
            logApiStatus(api),
          );

          if (retryCount < maxRetries) {
            setTimeout(() => {
              isFetchingRef.current = false;
              fetchData(retryCount + 1, maxRetries);
            }, 5000);
            return;
          }

          setError('API 연결이 없습니다. 페이지를 새로고침 해주세요.');
          setLoading(false);
          return;
        }

        if (!baseIdFromUrl || !quoteIdFromUrl) {
          setError('토큰 ID가 제공되지 않았습니다');
          setLoading(false);
          return;
        }

        // 최초 1회만 호출 (캐시 활용)
        const poolMetadata = await getPoolMetadata(baseIdFromUrl, quoteIdFromUrl);
        const poolQueryResponse = await getPoolQueryRpc(baseIdFromUrl, quoteIdFromUrl);
        const poolIndex = await findPoolIndexByPair(baseIdFromUrl, quoteIdFromUrl);
        let poolInfoData: PoolInfo | null = null;

        if (poolIndex !== null) {
          try {
            poolInfoData = await poolQueryResponse(baseIdFromUrl, quoteIdFromUrl);
          } catch (error) {
            poolInfoData = null;
          }
        }

        const parseNumber = (v: any) =>
          typeof v === 'string' ? Number(v.replace(/,/g, '')) : Number(v);

        const processedData: PoolInfoDisplay = {
          baseAssetId: baseIdFromUrl,
          quoteAssetId: quoteIdFromUrl,
          reserve0: parseNumber(poolQueryResponse.data?.baseReserve),
          reserve1: parseNumber(poolQueryResponse.data?.quoteReserve),
          lpTokenId: poolInfoData?.lpTokenId ?? 0,
          feeTier: poolInfoData?.feeTier ?? 0,
          poolExists: !!poolQueryResponse.data,
          poolIndex: poolIndex ?? undefined,
          takerFeeRate: poolMetadata?.takerFeeRate
            ? parseFloat(String(poolMetadata.takerFeeRate).replace('%', '')) / 100
            : undefined,
          lotSize: parseNumber(poolMetadata?.lotSize),
          tickSize: parseNumber(poolMetadata?.tickSize),
          poolDecimals: parseNumber(poolMetadata?.poolDecimals),
          baseAssetDecimals: parseNumber(poolMetadata?.baseDecimals),
          quoteAssetDecimals: parseNumber(poolMetadata?.quoteDecimals),
          asks: poolQueryResponse.data?.asks,
          bids: poolQueryResponse.data?.bids,
          poolPrice: parseNumber(poolQueryResponse.data?.poolPrice),
          poolMetadata,
          poolQueryRaw: poolQueryResponse.data,
        };

        if (!processedData.poolExists || processedData.reserve0 === 0) {
          // 데이터가 유효하지 않으면 setPoolInfo 하지 않음
          return;
        }
        setPoolInfo(processedData);
      } catch (err) {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            isFetchingRef.current = false;
            fetchData(retryCount + 1, maxRetries);
          }, 2000);
          return;
        }
        setLoading(false);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [
      api,
      baseIdFromUrl,
      quoteIdFromUrl,
      getPoolQueryRpc,
      findPoolIndexByPair,
      setPoolInfo,
      setLoading,
      setError,
      isConnected,
      isReady,
      getPoolMetadata,
    ],
  );

  useEffect(() => {
    if (isApiReady(api, isConnected, isReady) && baseIdFromUrl && quoteIdFromUrl) {
      fetchData();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isApiReady(api, isConnected, isReady) && baseIdFromUrl && quoteIdFromUrl) {
        fetchData();
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [api, baseIdFromUrl, quoteIdFromUrl, isConnected, isReady, fetchData]);

  // API 및 토큰 ID가 준비되면 초기 데이터 가져오기
  useEffect(() => {
    let mounted = true;
    let fetchTimeout: NodeJS.Timeout | null = null;

    const initData = async () => {
      if (
        isApiReady(api, isConnected, isReady) &&
        baseIdFromUrl &&
        quoteIdFromUrl &&
        mounted
      ) {
        // 이전 타임아웃이 있다면 취소
        if (fetchTimeout) {
          clearTimeout(fetchTimeout);
        }

        // 약간의 지연 후 데이터 가져오기 (다른 초기화 작업이 완료되도록)
        fetchTimeout = setTimeout(async () => {
          if (mounted) {
            await fetchData();
          }
        }, 100);
      }
    };

    initData();

    return () => {
      mounted = false;
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
    };
  }, [api, baseIdFromUrl, quoteIdFromUrl, fetchData, isConnected, isReady]);

  // refreshPoolData가 호출되면 데이터 새로고침
  useEffect(() => {
    let mounted = true;
    let prevLoading = usePoolDataStore.getState().loading;
    let prevError = usePoolDataStore.getState().error;

    const unsubscribe = usePoolDataStore.subscribe((state) => {
      if (!mounted) return;

      const newLoading = state.loading;
      const newError = state.error;

      // loading이 true로 설정되고 error가 null인 경우 새로고침 트리거
      if (newLoading && newError === null && (!prevLoading || prevError !== null)) {
        const doRefresh = async () => {
          if (
            mounted &&
            isApiReady(api, isConnected, isReady) &&
            baseIdFromUrl &&
            quoteIdFromUrl
          ) {
            await fetchData();
          } else if (mounted) {
            setError('API 연결이 없거나 토큰 ID가 유효하지 않습니다');
            setLoading(false);
          }
        };

        doRefresh();
      }

      // 상태 업데이트
      prevLoading = newLoading;
      prevError = newError;
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [
    api,
    baseIdFromUrl,
    quoteIdFromUrl,
    fetchData,
    setError,
    setLoading,
    isConnected,
    isReady,
  ]);

  // 수동 새로고침 함수
  const manualRefresh = () => {
    refreshPoolData();
  };

  // 실시간 데이터와 함수 반환
  return {
    fetchData,
    manualRefresh,
    poolInfoRef, // 실시간 데이터 접근을 위한 ref 제공
    poolIndexRef,
    unsubscribeAll,
  };
}

function extractFeeRate(poolMeta: any): number | undefined {
  if (!poolMeta) return undefined;
  let raw = poolMeta.takerFeeRate ?? poolMeta.feeRate ?? poolMeta.fee ?? undefined;

  if (typeof raw === 'string') {
    // "0.03%" 형태라면
    if (raw.endsWith('%')) {
      return parseFloat(raw.replace('%', '')) / 100;
    }
    // "0.003" 형태라면
    return parseFloat(raw);
  }
  if (typeof raw === 'number') {
    // 1보다 크면 %로 간주, 아니면 소수로 간주
    return raw > 1 ? raw / 100 : raw;
  }
  return undefined;
}
