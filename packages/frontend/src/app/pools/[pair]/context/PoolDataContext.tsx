'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';

import { useApi } from '@/hooks/useApi';

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

// API 상태 확인 함수
const isApiReady = (api: any): boolean => {
  // API가 정의되어 있고, 객체 형태이며, 최소한 isReady 또는 isConnected 속성 중 하나가 true인 경우
  return !!api && typeof api === 'object' && (api.isReady || api.isConnected);
};

// 풀 데이터 로직을 위한 훅
export function usePoolDataFetcher() {
  const { api } = useApi();
  const params = useParams();
  const searchParams = useSearchParams();

  // URL에서 토큰 ID 추출
  const pairString = params?.pair?.toString() || '';
  console.log('원본 pair 문자열:', pairString);

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

  console.log('쿼리 파라미터에서 추출한 토큰 ID:', { baseId, quoteId });

  // 2. 쿼리 파라미터가 없으면 URL 경로에서 추출 시도
  if ((!baseId || !quoteId) && pairString) {
    // URL 디코딩 (WO%2FWF -> WO/WF)
    const decodedPair = decodeURIComponent(pairString);
    console.log('디코딩된 pair 문자열:', decodedPair);

    // 분리자로 분리 시도 (예: WO/WF, WO-WF)
    const pairParts =
      decodedPair.split('/').length === 2
        ? decodedPair.split('/')
        : decodedPair.split('-').length === 2
          ? decodedPair.split('-')
          : [];

    console.log('분리된 pair 부분:', pairParts);

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
  }

  // 최종 변환
  const baseIdFromUrl = baseId ? parseInt(baseId, 10) : NaN;
  const quoteIdFromUrl = quoteId ? parseInt(quoteId, 10) : NaN;

  console.log('최종 추출된 토큰 ID:', {
    baseId: baseIdFromUrl,
    quoteId: quoteIdFromUrl,
    originalPath: pairString,
  });

  // 풀 쿼리 함수들
  const { getPoolQueryRpc, findPoolIndexByPair, getPoolInfo, subscribeToOrderbook } =
    usePoolQueries();

  // 개별 액션을 직접 선택하여 객체 생성을 방지
  const setPoolInfo = usePoolDataStore((state) => state.setPoolInfo);
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
        console.error('[Unsubscribe] 구독 해제 실패:', err);
      }
    }
  }, []);

  // 실시간 데이터 접근을 위한 Ref 추가
  const poolInfoRef = useRef<PoolInfoDisplay | null>(null);
  const poolIndexRef = useRef<number | null>(null);

  // 구독 관리 Refs
  const subscriptionsRef = useRef<{
    pool?: any; // Polkadot.js unsubscribe function can be various types
    orderbook?: any; // Combination of unsubscribe functions
    trades?: any; // Polkadot.js unsubscribe function
    metadataInterval?: NodeJS.Timeout;
  }>({});

  // 모든 구독 해제 함수
  const unsubscribeAll = useCallback(() => {
    console.log('[PoolDataStore] 모든 구독 해제 중');

    // 풀 구독 해제
    if (subscriptionsRef.current.pool) {
      try {
        const unsubFn = subscriptionsRef.current.pool;
        if (typeof unsubFn === 'function') {
          unsubFn();
          console.log('[PoolSubscription] 풀 구독 해제 완료');
        } else {
          console.log(
            '[PoolSubscription] 풀 구독 해제 함수가 유효하지 않음:',
            typeof unsubFn,
          );
        }
        subscriptionsRef.current.pool = undefined;
      } catch (err) {
        console.error('[PoolSubscription] 풀 구독 해제 오류:', err);
      }
    }

    // 오더북 구독 해제
    if (subscriptionsRef.current.orderbook) {
      try {
        const unsubFn = subscriptionsRef.current.orderbook;
        if (typeof unsubFn === 'function') {
          unsubFn();
          console.log('[OrderbookSubscription] 오더북 구독 해제 완료');
        }
        subscriptionsRef.current.orderbook = undefined;
      } catch (err) {
        console.error('[OrderbookSubscription] 오더북 구독 해제 오류:', err);
      }
    }

    // 거래 구독 해제
    if (subscriptionsRef.current.trades) {
      try {
        const unsubFn = subscriptionsRef.current.trades;
        if (typeof unsubFn === 'function') {
          unsubFn();
          console.log('[TradesSubscription] 거래 구독 해제 완료');
        }
        subscriptionsRef.current.trades = undefined;
      } catch (err) {
        console.error('[TradesSubscription] 거래 구독 해제 오류:', err);
      }
    }

    // 메타데이터 폴링 해제
    if (subscriptionsRef.current.metadataInterval) {
      clearInterval(subscriptionsRef.current.metadataInterval);
      subscriptionsRef.current.metadataInterval = undefined;
      console.log('[TokenPolling] 메타데이터 폴링 해제 완료');
    }

    // 구독 상태 업데이트
    setSubscribed(false);
    console.log('[Subscriptions] 모든 구독 해제 완료');
  }, [setSubscribed]);

  // 오더북 구독 해제 헬퍼 함수
  const combinedOrderbookUnsubscribe = useCallback(
    (unsubAsks?: () => void, unsubBids?: () => void) => {
      try {
        safeUnsubscribe(unsubAsks);
        safeUnsubscribe(unsubBids);
      } catch (err) {
        console.error('[OrderbookSubscription] 구독 해제 중 오류', err);
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
      };

      // Ref와 상태 모두 업데이트
      poolInfoRef.current = updatedPoolInfo;
      setPoolInfo(updatedPoolInfo);

      console.log('[TokenPolling] 토큰 메타데이터 업데이트 완료');
    } catch (err) {
      console.error('[TokenPolling] 메타데이터 업데이트 실패:', err);
    }
  }, [api, baseIdFromUrl, quoteIdFromUrl, setPoolInfo]);

  // API 준비되면 구독 설정하는 함수
  const setupSubscriptions = useCallback(async () => {
    if (!isApiReady(api)) {
      console.log('[Subscription] API가 준비되지 않았습니다. 구독을 설정할 수 없습니다.');
      return;
    }

    if (!baseIdFromUrl || !quoteIdFromUrl) {
      console.log('[Subscription] 토큰 ID가 유효하지 않습니다. 구독을 설정할 수 없습니다.');
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
      );

      // 풀 인덱스 찾기
      const poolIndex = await findPoolIndexByPair(baseIdFromUrl, quoteIdFromUrl);
      if (poolIndex === null) {
        console.log('[Subscription] 풀을 찾을 수 없습니다.');
        setError('해당 토큰 페어의 풀을 찾을 수 없습니다');
        setLoading(false);
        return;
      }

      // 풀 인덱스 저장
      poolIndexRef.current = poolIndex;

      // 풀 구독 설정
      try {
        // 직접 구독 대신 polling으로 변경 (구독 기능이 불안정할 수 있음)
        const unsub = await api?.query.hybridOrderbook.pools(
          poolIndex,
          async (poolData: any) => {
            if (!poolData || !poolData.isSome) return;

            try {
              // 풀 정보 업데이트
              const poolInfo = await getPoolInfo(poolIndex);

              if (!poolInfo) return;

              // Ref와 상태 모두 업데이트
              poolInfoRef.current = {
                ...poolInfoRef.current,
                ...poolInfo,
              };

              // UI 리렌더링을 위한 상태 업데이트 (최소화)
              setPoolInfo(poolInfoRef.current);

              console.log('[PoolSubscription] 풀 데이터 업데이트 완료');
            } catch (err) {
              console.error('[PoolSubscription] 풀 데이터 처리 오류:', err);
            }
          },
        );

        if (!unsub) {
          throw new Error('풀 구독에 실패했습니다. 유효한 풀 모듈을 찾을 수 없습니다.');
        }

        subscriptionsRef.current.pool = unsub;
        console.log('[PoolSubscription] 풀 구독 설정 완료');
      } catch (err) {
        console.error('[PoolSubscription] 풀 구독 설정 오류:', err);
        setError('풀 구독 설정 중 오류가 발생했습니다');
        setLoading(false);
      }

      // Orderbook 구독 설정
      try {
        const { unsubAsks, unsubBids } = await subscribeToOrderbook(
          api,
          baseIdFromUrl,
          quoteIdFromUrl,
          (orderbook: any) => {
            const currentPoolInfo = poolInfoRef.current;
            if (!currentPoolInfo) return;

            // 경량 해시 비교로 변경 감지 (JSON.stringify보다 빠름)
            const oldAsksHash = createLightHash(currentPoolInfo.asks);
            const newAsksHash = createLightHash(orderbook.asks);
            const oldBidsHash = createLightHash(currentPoolInfo.bids);
            const newBidsHash = createLightHash(orderbook.bids);

            // 변경 감지 (해시 비교)
            const asksChanged = orderbook.asks && oldAsksHash !== newAsksHash;
            const bidsChanged = orderbook.bids && oldBidsHash !== newBidsHash;

            // 의미 있는 변경이 있는 경우에만 상태 업데이트
            if (asksChanged || bidsChanged) {
              // 불필요한 복사 제거하고 최적화된 업데이트
              const updatedPoolInfo = {
                ...currentPoolInfo,
                asks: orderbook.asks || currentPoolInfo.asks,
                bids: orderbook.bids || currentPoolInfo.bids,
                lastUpdated: Date.now(),
              };

              // ref 업데이트
              poolInfoRef.current = updatedPoolInfo;

              // 상태 업데이트 - 최적화된 방식
              setPoolInfo(updatedPoolInfo); // 이미 새 객체라 얕은 복사 불필요
            }
          },
        );

        // 구독 해제 함수 저장 - 미리 정의된 함수를 호출하도록 수정
        subscriptionsRef.current.orderbook = () =>
          combinedOrderbookUnsubscribe(unsubAsks, unsubBids);
        console.log('[OrderbookSubscription] 오더북 구독 설정 완료');
      } catch (err) {
        console.error('[OrderbookSubscription] 오더북 구독 설정 오류:', err);
      }

      // 초기 메타데이터 업데이트 실행
      await updateTokenMetadata();

      // 주기적 업데이트 설정 (10초마다)
      const metadataInterval = setInterval(updateTokenMetadata, 10000);
      subscriptionsRef.current.metadataInterval = metadataInterval;
      console.log('[TokenPolling] 메타데이터 폴링 설정 완료');

      // 구독 상태 설정
      setSubscribed(true);
    } catch (error) {
      console.error('[Subscription] 구독 설정 오류:', error);
      setSubscribed(false);
      setError('구독 설정 중 오류가 발생했습니다');
    }
  }, [
    api,
    baseIdFromUrl,
    quoteIdFromUrl,
    unsubscribeAll,
    findPoolIndexByPair,
    getPoolInfo,
    setError,
    setLoading,
    setPoolInfo,
    subscribeToOrderbook,
    combinedOrderbookUnsubscribe,
    updateTokenMetadata,
    setSubscribed,
  ]);

  // 구독 기반 업데이트 설정
  useEffect(() => {
    // API 객체가 없으면 초기 로드 단계이므로 리턴
    if (!api) {
      console.log('[PoolDataStore] API가 없어 구독 설정을 건너뜁니다.');
      return;
    }

    // 구독 설정 함수 호출
    setupSubscriptions();

    // 정리 함수는 unsubscribeAll을 호출
    return () => {
      unsubscribeAll();
    };
  }, [api, setupSubscriptions, unsubscribeAll]);

  // 데이터 가져오기 함수
  const fetchData = useCallback(
    async (retryCount = 0, maxRetries = 3) => {
      if (!isApiReady(api)) {
        console.log(
          `[PoolDataStore] API가 준비되지 않음, 재시도 ${retryCount}/${maxRetries}`,
        );

        if (retryCount < maxRetries) {
          // API가 준비되지 않았을 때 재시도
          setTimeout(() => fetchData(retryCount + 1, maxRetries), 1000);
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

      try {
        console.log('[PoolDataStore] 풀 데이터 가져오기 시작', {
          baseId: baseIdFromUrl,
          quoteId: quoteIdFromUrl,
          apiReady: isApiReady(api),
        });

        // 풀 쿼리 데이터 가져오기
        const poolQueryResponse = await getPoolQueryRpc(baseIdFromUrl, quoteIdFromUrl);

        if (!poolQueryResponse.success) {
          console.error('[PoolDataStore] 풀 데이터 가져오기 실패', poolQueryResponse.error);
          setError('풀 데이터를 가져오는 중 오류 발생');
          setLoading(false);
          return;
        }

        // Extract pool data from the query response
        const poolData = poolQueryResponse.data;
        console.log('[PoolDataStore] Raw pool data from query:', poolData);

        // 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseIdFromUrl, quoteIdFromUrl);
        console.log('[PoolDataStore] Pool index search result:', poolIndex);

        // 풀 인덱스가 있으면 풀 정보 가져오기
        let poolInfoData: PoolInfo | null = null;
        if (poolIndex !== null) {
          try {
            poolInfoData = await getPoolInfo(poolIndex);
          } catch (error) {
            console.warn(
              `[PoolDataStore] getPoolInfo 오류 무시 (poolIndex: ${poolIndex}):`,
              error,
            );
            // 오류가 발생해도 계속 진행 - 풀 데이터는 poolQueryResponse에서도 얻을 수 있음
          }
        }

        // 토큰 메타데이터 가져오기
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

        // 데이터 처리 및 상태 업데이트
        const processedData: PoolInfoDisplay = {
          baseAssetId: baseIdFromUrl,
          quoteAssetId: quoteIdFromUrl,
          // poolInfoData가 있으면 그 값을 사용하고, 없으면 기본값 설정
          reserve0: poolData?.baseReserve
            ? Number(poolData.baseReserve.replace(/,/g, ''))
            : (poolInfoData?.reserve0 ?? 0),
          reserve1: poolData?.quoteReserve
            ? Number(poolData.quoteReserve.replace(/,/g, ''))
            : (poolInfoData?.reserve1 ?? 0),
          lpTokenId: poolInfoData?.lpTokenId ?? 0,
          feeTier: poolData?.takerFeeRate
            ? Number(poolData.takerFeeRate.replace('%', '').replace(/,/g, '')) * 100
            : (poolInfoData?.feeTier ?? 0),
          poolExists:
            poolInfoData?.poolExists ??
            (poolData?.baseReserve && poolData?.quoteReserve ? true : false),

          poolIndex: poolInfoData?.poolIndex,

          // Include pool price and decimals from poolQueryResponse
          poolPrice: poolData?.poolPrice ? Number(poolData.poolPrice.replace(/,/g, '')) : 0,
          poolDecimals: poolData?.poolDecimals
            ? Number(poolData.poolDecimals.replace(/,/g, ''))
            : 0,

          // 실제 메타데이터 적용
          baseAssetSymbol: baseSymbol,
          quoteAssetSymbol: quoteSymbol,
          baseAssetDecimals: baseDecimals,
          quoteAssetDecimals: quoteDecimals,

          // asks와 bids 원본 데이터 저장 (오더북 표시용)
          asks: poolData?.asks || {},
          bids: poolData?.bids || {},

          // 원본 poolData 저장 - 필요한 경우 나중에 참조할 수 있음
          rawData: poolData || {},
        };

        console.log('[PoolDataStore] 풀 데이터 가져오기 성공', processedData);

        // 스토어 상태 업데이트
        setPoolInfo(processedData);
        setLoading(false);
      } catch (err) {
        console.error('[PoolDataStore] 풀 데이터 가져오기 오류:', err);
        setError('풀 데이터를 가져오는 중 오류 발생');
        setLoading(false);
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
    ],
  );

  // API 및 토큰 ID가 준비되면 초기 데이터 가져오기
  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      // 명시적 API 상태 확인
      if (isApiReady(api) && baseIdFromUrl && quoteIdFromUrl && mounted) {
        console.log('[PoolDataStore] API 준비됨, 초기 데이터 가져오기 시작');
        await fetchData();
      } else if (mounted) {
        console.log('[PoolDataStore] API 또는 토큰 ID가 준비되지 않음:', {
          apiReady: isApiReady(api),
          baseId: baseIdFromUrl,
          quoteId: quoteIdFromUrl,
        });
      }
    };

    initData();

    return () => {
      mounted = false;
    };
  }, [api, baseIdFromUrl, quoteIdFromUrl, fetchData]);

  // refreshPoolData가 호출되면 데이터 새로고침
  useEffect(() => {
    // 이전 상태 저장
    let prevLoading = usePoolDataStore.getState().loading;
    let prevError = usePoolDataStore.getState().error;

    // 단일 콜백 형태로 사용
    const unsubscribe = usePoolDataStore.subscribe((state) => {
      const newLoading = state.loading;
      const newError = state.error;

      // loading이 true로 설정되고 error가 null인 경우 새로고침 트리거
      if (newLoading && newError === null && (!prevLoading || prevError !== null)) {
        console.log('[PoolDataStore] 새로고침 요청 수신');

        const doRefresh = async () => {
          if (isApiReady(api) && baseIdFromUrl && quoteIdFromUrl) {
            await fetchData();
          } else {
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
      unsubscribe();
    };
  }, [api, baseIdFromUrl, quoteIdFromUrl, fetchData, setError, setLoading]);

  useEffect(() => {
    let isSubscribed = true;

    // Function to check API readiness
    const checkApiAndFetch = async () => {
      if (!isApiReady(api)) {
        console.log('[PoolDataStore] API not ready yet, waiting...');
        // Check again in 500ms
        setTimeout(checkApiAndFetch, 500);
        return;
      }

      console.log('[PoolDataStore] API is now ready, fetching data...');
      if (isSubscribed && baseIdFromUrl && quoteIdFromUrl) {
        await fetchData();
      }
    };

    checkApiAndFetch();

    return () => {
      isSubscribed = false;
    };
  }, [api, baseIdFromUrl, quoteIdFromUrl, fetchData]);

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
    console.error('심볼 추출 오류:', err);
    return 'UNKNOWN';
  }
}
