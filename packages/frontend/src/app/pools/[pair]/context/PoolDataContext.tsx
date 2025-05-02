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

  // 오더북 데이터
  asks?: any;
  bids?: any;

  // 원본 데이터
  rawData?: any;
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
}

// 스토어 생성
export const usePoolDataStore = create<PoolDataState>((set) => ({
  poolInfo: null,
  loading: true,
  error: null,
  isSubscribed: false,

  setPoolInfo: (poolInfo) => set({ poolInfo }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  refreshPoolData: () => {
    set({ loading: true, error: null });
  },
  setSubscribed: (isSubscribed) => set({ isSubscribed }),
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
  const isSettingUpRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  const { getPoolQueryRpc, findPoolIndexByPair, getPoolInfo, subscribeToOrderbook } =
    usePoolQueries();

  // 개별 액션을 직접 선택하여 객체 생성을 방지
  const setLoading = usePoolDataStore((state) => state.setLoading);
  const setError = usePoolDataStore((state) => state.setError);
  const refreshPoolData = usePoolDataStore((state) => state.refreshPoolData);
  const setSubscribed = usePoolDataStore((state) => state.setSubscribed);

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

      const baseSymbol = extractSymbol(baseMeta);
      const baseDecimals = extractDecimals(baseMeta?.toHuman());
      const quoteSymbol = extractSymbol(quoteMeta);
      const quoteDecimals = extractDecimals(quoteMeta?.toHuman());

      const currentPoolInfo = usePoolDataStore.getState().poolInfo;
      if (!currentPoolInfo) return;

      const updatedPoolInfo = {
        ...currentPoolInfo,
        baseAssetSymbol: baseSymbol,
        baseAssetDecimals: baseDecimals,
        quoteAssetSymbol: quoteSymbol,
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

  const setupSubscriptions = useCallback(async () => {
    if (isSettingUpRef.current) return; // 중복 실행 방지
    isSettingUpRef.current = true;

    try {
      if (!isApiReady(api, isConnected, isReady)) {
        console.log('[Subscription] API가 준비되지 않았습니다. 2초 후 재시도합니다.');
        if (!retryTimeoutRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            isSettingUpRef.current = false;
            setupSubscriptions();
          }, 2000);
        }
        return;
      }

      if (!baseIdFromUrl || !quoteIdFromUrl) {
        console.log(
          '[Subscription] 토큰 ID가 유효하지 않습니다. 구독을 설정할 수 없습니다.',
        );
        isSettingUpRef.current = false;
        return;
      }

      // 이미 구독 중인 경우 해제 후 재설정
      if (usePoolDataStore.getState().isSubscribed) {
        console.log('[Subscription] 기존 구독 해제 후 재설정');
        unsubscribeAll();
      }

      try {
        console.log(
          '[Subscription] 풀 구독 설정 시작:',
          'baseId =',
          baseIdFromUrl,
          'quoteId =',
          quoteIdFromUrl,
          'API 상태:',
          logApiStatus(api),
        );

        // 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseIdFromUrl, quoteIdFromUrl);
        if (poolIndex === null) {
          console.log('[Subscription] 풀을 찾을 수 없습니다.');
          setError('해당 토큰 페어의 풀을 찾을 수 없습니다');
          setLoading(false);
          isSettingUpRef.current = false;
          return;
        }

        poolIndexRef.current = poolIndex;

        // 초기 풀 데이터 가져오기
        const initialPoolInfo = await getPoolInfo(poolIndex);
        if (initialPoolInfo) {
          setPoolInfo(initialPoolInfo);
          setError(null);
        }

        // 풀 구독 설정
        if (!isApiReady(api, isConnected, isReady)) {
          console.error('API가 준비되지 않음');
          isSettingUpRef.current = false;
          return;
        }

        const unsub = await api?.query.hybridOrderbook.pools(
          poolIndex,
          async (poolData: any) => {
            if (!poolData || (poolData.isNone !== undefined && poolData.isNone)) {
              console.log('[PoolSubscription] poolData가 None이므로 무시');
              return;
            }

            try {
              const poolInfo = await getPoolInfo(poolIndex);
              if (!poolInfo || poolInfo.baseAssetId === 0 || poolInfo.quoteAssetId === 0) {
                console.log('[PoolSubscription] poolInfo가 비어있으므로 무시', poolInfo);
                return;
              }
              setPoolInfo(poolInfo);
              setError(null);
            } catch (err) {
              setError('풀 데이터 갱신 중 오류 발생');
            }
          },
        );

        if (!unsub) {
          console.error('구독 함수가 반환되지 않음');
        } else {
          console.log('구독 연결 성공');
        }

        subscriptionsRef.current.pool = unsub;

        // 초기 메타데이터 업데이트 실행
        await updateTokenMetadata();

        // 주기적 업데이트 설정 (10초마다)
        const metadataInterval = setInterval(updateTokenMetadata, 10000);
        subscriptionsRef.current.metadataInterval = metadataInterval;

        setSubscribed(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Subscription] 구독 설정 오류:', error);
        }
        // 오류 발생 시 2초 후 재시도
        if (!retryTimeoutRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            isSettingUpRef.current = false;
            setupSubscriptions();
          }, 2000);
        }
        setSubscribed(false);
        setError('구독 설정 중 오류가 발생했습니다');
      }
    } finally {
      isSettingUpRef.current = false;
    }
  }, [
    api,
    isConnected,
    isReady,
    baseIdFromUrl,
    quoteIdFromUrl,
    unsubscribeAll,
    findPoolIndexByPair,
    getPoolInfo,
    setError,
    setLoading,
    setPoolInfo,
    updateTokenMetadata,
    setSubscribed,
  ]);

  useEffect(() => {
    setupSubscriptions();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      isSettingUpRef.current = false;
      unsubscribeAll();
    };
  }, [api, setupSubscriptions, unsubscribeAll]);

  // 데이터 가져오기 함수
  const fetchData = useCallback(
    async (retryCount = 0, maxRetries = 3) => {
      // 중복 호출 방지
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
            // API가 준비되지 않은 경우 더 긴 대기 시간 설정
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

        console.log('[PoolDataStore] 풀 데이터 가져오기 시작', {
          baseId: baseIdFromUrl,
          quoteId: quoteIdFromUrl,
          apiReady: isApiReady(api, isConnected, isReady),
        });

        // 풀 쿼리 데이터 가져오기
        const poolQueryResponse = await getPoolQueryRpc(baseIdFromUrl, quoteIdFromUrl);

        if (!poolQueryResponse.success) {
          console.error('[PoolDataStore] 풀 데이터 가져오기 실패', poolQueryResponse.error);

          // API 연결 오류인 경우 재시도
          if (
            poolQueryResponse.error?.includes('API not connected') &&
            retryCount < maxRetries
          ) {
            setTimeout(() => {
              isFetchingRef.current = false;
              fetchData(retryCount + 1, maxRetries);
            }, 5000);
            return;
          }

          setError('풀 데이터를 가져오는 중 오류 발생');
          setLoading(false);
          return;
        }

        // Extract pool data from the query response
        const poolData = poolQueryResponse.data;

        // 풀 인덱스 찾기 (캐싱을 위해 한 번만 호출)
        const poolIndex = await findPoolIndexByPair(baseIdFromUrl, quoteIdFromUrl);

        // 토큰 메타데이터 가져오기 (공통으로 사용)
        const [baseMeta, quoteMeta] = await Promise.all([
          api?.query.assets.metadata(baseIdFromUrl),
          api?.query.assets.metadata(quoteIdFromUrl),
        ]);

        const baseMetaHuman = baseMeta?.toHuman();
        const quoteMetaHuman = quoteMeta?.toHuman();

        // 메타데이터에서 정보 추출
        const baseSymbol = extractSymbol(baseMeta);
        const baseDecimals = extractDecimals(baseMetaHuman);
        const quoteSymbol = extractSymbol(quoteMeta);
        const quoteDecimals = extractDecimals(quoteMetaHuman);

        // 풀 데이터 처리 함수
        const processPoolData = (
          poolInfo: PoolInfo | null,
          poolData: any,
        ): PoolInfoDisplay => {
          const isPoolInfoValid =
            poolInfo && poolInfo.baseAssetId !== 0 && poolInfo.quoteAssetId !== 0;

          return {
            baseAssetId: baseIdFromUrl,
            quoteAssetId: quoteIdFromUrl,
            reserve0: isPoolInfoValid
              ? poolInfo.reserve0
              : poolData?.baseReserve
                ? Number(poolData.baseReserve.replace(/,/g, ''))
                : 0,
            reserve1: isPoolInfoValid
              ? poolInfo.reserve1
              : poolData?.quoteReserve
                ? Number(poolData.quoteReserve.replace(/,/g, ''))
                : 0,
            lpTokenId: isPoolInfoValid ? poolInfo.lpTokenId : 0,
            feeTier: isPoolInfoValid
              ? poolInfo.feeTier
              : poolData?.takerFeeRate
                ? Number(poolData.takerFeeRate.replace('%', '').replace(/,/g, '')) * 100
                : 0,
            poolExists: isPoolInfoValid
              ? poolInfo.poolExists
              : poolData?.baseReserve && poolData?.quoteReserve
                ? true
                : false,
            poolIndex: isPoolInfoValid ? poolInfo.poolIndex : undefined,
            poolPrice: poolData?.poolPrice
              ? Number(poolData.poolPrice.replace(/,/g, ''))
              : 0,
            poolDecimals: poolData?.poolDecimals
              ? Number(poolData.poolDecimals.replace(/,/g, ''))
              : 0,
            baseAssetSymbol: baseSymbol,
            quoteAssetSymbol: quoteSymbol,
            baseAssetDecimals: baseDecimals,
            quoteAssetDecimals: quoteDecimals,
            asks: poolData?.asks || {},
            bids: poolData?.bids || {},
            rawData: poolData || {},
          };
        };

        // 풀 인덱스가 있으면 풀 정보 가져오기
        let poolInfoData: PoolInfo | null = null;
        if (poolIndex !== null) {
          try {
            poolInfoData = await getPoolInfo(poolIndex);
          } catch (error) {
            console.warn(
              `[PoolDataStore] getPoolInfo 오류 (poolIndex: ${poolIndex}):`,
              error,
            );
          }
        }

        // 풀 데이터 처리 및 상태 업데이트
        const processedData = processPoolData(poolInfoData, poolData);
        setPoolInfo(processedData);
        setLoading(false);
      } catch (err) {
        // 오류 발생 시 1초 후 재시도
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
      getPoolInfo,
      setPoolInfo,
      setLoading,
      setError,
      isConnected,
      isReady,
    ],
  );

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
    setupSubscriptions,
  };
}

// 메타데이터에서 심볼 추출하는 유틸리티 함수
function extractSymbol(metadata: any): string {
  try {
    const human = metadata.toHuman ? metadata.toHuman() : metadata;
    return human?.symbol || 'UNKNOWN';
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('심볼 추출 오류:', err);
    }
    return 'UNKNOWN';
  }
}
