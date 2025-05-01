'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
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
}

// 스토어 생성
export const usePoolDataStore = create<PoolDataState>((set) => ({
  poolInfo: null,
  loading: true,
  error: null,

  setPoolInfo: (poolInfo) => set({ poolInfo }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  refreshPoolData: () => {
    set({ loading: true, error: null });
  },
}));

// 셀렉터 함수들
export const selectPoolInfo = (state: PoolDataState) => state.poolInfo;
export const selectLoading = (state: PoolDataState) => state.loading;
export const selectError = (state: PoolDataState) => state.error;

// API 상태 확인 함수
const isApiReady = (api: any): boolean => {
  return !!api && api.isReady && api.isConnected;
};

// 풀 데이터 로직을 위한 훅
export function usePoolDataFetcher() {
  const { api } = useApi();
  const params = useParams();
  const searchParams = useSearchParams();

  // 개별 액션을 직접 선택하여 객체 생성을 방지
  const setPoolInfo = usePoolDataStore((state) => state.setPoolInfo);
  const setLoading = usePoolDataStore((state) => state.setLoading);
  const setError = usePoolDataStore((state) => state.setError);
  const refreshPoolData = usePoolDataStore((state) => state.refreshPoolData);

  // 풀 쿼리 함수들
  const { getPoolQueryRpc, findPoolIndexByPair, getPoolInfo } = usePoolQueries();

  // URL에서 토큰 ID 추출
  const pairString = params?.pair?.toString() || '';
  console.log('원본 pair 문자열:', pairString);

  // 1. 쿼리 파라미터에서 추출 (baseId, quoteId)
  let baseId = searchParams?.get('baseId');
  let quoteId = searchParams?.get('quoteId');

  console.log('쿼리 파라미터에서 추출한 토큰 ID:', { baseId, quoteId });

  // 2. 쿼리 파라미터가 없으면 URL 경로에서 추출 시도
  if ((!baseId || !quoteId) && pairString) {
    // URL 디코딩 (WO%2FWF -> WO/WF)
    const decodedPair = decodeURIComponent(pairString);
    console.log('디코딩된 pair 문자열:', decodedPair);

    // 슬래시나 대시로 분리 가능
    const separator = decodedPair.includes('/') ? '/' : '-';
    const pairParts = decodedPair.split(separator);

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

    if (pairParts.length >= 2) {
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
          poolInfoData = await getPoolInfo(poolIndex);
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
        console.log('[PoolDataStore] API 또는 토큰 ID 준비 안됨:', {
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

  // 구독 기반 업데이트 설정
  useEffect(() => {
    // API 객체가 없으면 초기 로드 단계이므로 리턴
    if (!api) {
      console.log('[PoolDataStore] API 객체가 아직 설정되지 않음');
      return;
    }

    // 토큰 ID가 없으면 리턴
    if (!baseIdFromUrl || !quoteIdFromUrl) {
      console.log('[PoolDataStore] 토큰 ID가 설정되지 않음');
      return;
    }

    let unsubscribePoolListener: any | undefined;
    let metadataPollingInterval: NodeJS.Timeout | null = null;

    // API 준비 상태를 기다렸다가 구독 설정하는 함수
    const waitForApiAndSetupSubscriptions = async () => {
      try {
        console.log('[PoolDataStore] API ready 상태 기다리는 중...');

        // 이 부분이 중요: api.isReady를 기다림
        await api.isReady;

        console.log('[PoolDataStore] API가 준비되었습니다. 구독 설정 시작');

        // 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseIdFromUrl, quoteIdFromUrl);
        if (poolIndex === null) {
          console.log('[PoolDataStore] 풀 인덱스를 찾을 수 없음');
          return;
        }

        console.log('[PoolDataStore] 풀 인덱스 찾음:', poolIndex, '구독 설정 중');

        // 풀 데이터 구독
        api.query.hybridOrderbook
          .pools(poolIndex, (result: any) => {
            console.log('[PoolSubscription] 실시간 풀 데이터 업데이트 수신');
            // 현재 풀 정보 가져오기
            const currentPoolInfo = usePoolDataStore.getState().poolInfo;
            if (!currentPoolInfo) return;

            // 결과에서 reserve 값 추출 (실제 API 응답에 맞게 조정 필요)
            const resultHuman = result.toHuman();
            const reserve0 = resultHuman?.reserve0
              ? Number(resultHuman.reserve0)
              : currentPoolInfo.reserve0;
            const reserve1 = resultHuman?.reserve1
              ? Number(resultHuman.reserve1)
              : currentPoolInfo.reserve1;

            // 풀 정보 업데이트
            setPoolInfo({
              ...currentPoolInfo,
              reserve0,
              reserve1,
            });
          })
          .then((unsub) => {
            unsubscribePoolListener = unsub;
          });

        // 토큰 메타데이터 폴링 설정 (구독 대신 폴링 사용)
        const updateTokenMetadata = async () => {
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

            usePoolDataStore.getState().setPoolInfo({
              ...currentPoolInfo,
              baseAssetSymbol: baseSymbol,
              baseAssetDecimals: baseDecimals,
              quoteAssetSymbol: quoteSymbol,
              quoteAssetDecimals: quoteDecimals,
            });

            console.log('[TokenPolling] 토큰 메타데이터 업데이트 완료');
          } catch (err) {
            console.error('[TokenPolling] 메타데이터 업데이트 실패:', err);
          }
        };

        // 초기 업데이트 실행
        await updateTokenMetadata();

        // 주기적 업데이트 설정 (10초마다)
        metadataPollingInterval = setInterval(updateTokenMetadata, 10000);
        console.log('[TokenPolling] 메타데이터 폴링 설정 완료');
      } catch (error) {
        console.error('[Subscription] 구독 설정 오류:', error);
      }
    };

    // 구독 설정 함수 호출
    waitForApiAndSetupSubscriptions();

    // refreshPoolData 함수 오버라이드
    const originalRefresh = usePoolDataStore.getState().refreshPoolData;

    const newRefresh = () => {
      originalRefresh(); // 원래 함수 호출 (loading 상태 변경)
      fetchData(); // 바로 데이터 가져오기
    };

    // 새로운 함수로 교체
    usePoolDataStore.setState({
      refreshPoolData: newRefresh,
    });

    return () => {
      // 모든 구독 해제
      if (unsubscribePoolListener) unsubscribePoolListener();

      // 메타데이터 폴링 중지
      if (metadataPollingInterval) {
        clearInterval(metadataPollingInterval);
        console.log('[TokenPolling] 메타데이터 폴링 정지');
      }

      // 원래 함수로 복원 (클린업)
      usePoolDataStore.setState({
        refreshPoolData: originalRefresh,
      });
    };
  }, [api, baseIdFromUrl, quoteIdFromUrl, findPoolIndexByPair, setPoolInfo, fetchData]);

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

  // 사용자가 직접 호출할 수 있는 refresh 함수
  const manualRefresh = () => {
    refreshPoolData();
  };

  return { fetchData, manualRefresh };
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
