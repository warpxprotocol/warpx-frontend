'use client';

import { useEffect, useState } from 'react';

import { getPolkadotApi } from '@/services/config/polkadot';

export default function OrderBook() {
  const [bids, setBids] = useState<number[][]>([]);
  const [asks, setAsks] = useState<number[][]>([]);
  const [apiStatus, setApiStatus] = useState<string>('연결 중...');
  const [lastEvent, setLastEvent] = useState<string>('이벤트 대기 중...');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eventUnsubscribe, setEventUnsubscribe] = useState<(() => void) | null>(null);

  // Polkadex 오더북 이벤트를 구독하는 함수
  const subscribeToOrderbookEvents = async () => {
    try {
      const api = await getPolkadotApi();

      // 먼저 이전 구독이 있으면 해제
      if (eventUnsubscribe) {
        eventUnsubscribe();
        setEventUnsubscribe(null);
      }

      setDebugInfo((prev) => [...prev, '오더북 이벤트 구독 시작...']);

      // 시스템 이벤트 구독
      const unsub = await api.query.system.events((events: any) => {
        // 로깅용: 모든 이벤트 종류 수집
        const allEventTypes = events.map((e: any) =>
          e.event ? `${e.event.section}.${e.event.method}` : 'unknown',
        );

        // 중복 제거된 이벤트 타입 로깅
        const uniqueEventTypes = [...new Set(allEventTypes)];
        if (uniqueEventTypes.length > 0) {
          console.log('수신된 이벤트 타입들:', uniqueEventTypes);
          setLastEvent(
            `최근 이벤트: ${new Date().toLocaleTimeString()} - ${uniqueEventTypes.length}개 타입`,
          );
        }

        // 오더북 관련 이벤트 필터링
        // 1. Polkadex 오더북 이벤트 찾기 (section이 'orderbook' 혹은 'hybridOrderbook')
        const orderBookEvents = events.filter((e: any) => {
          if (!e.event) return false;

          const section = e.event.section;
          const method = e.event.method;

          // Polkadex 오더북 관련 이벤트 확인
          return (
            // pallet 이름 확인
            (section === 'orderbook' || section === 'hybridOrderbook') &&
            // 이벤트 메소드 이름 확인
            (method === 'OrderPlaced' ||
              method === 'OrderExecuted' ||
              method === 'OrderCancelled' ||
              method === 'OrderExpired' ||
              method === 'MarketOrderPlaced' ||
              method === 'LimitOrderPlaced' ||
              method === 'Trade' ||
              method === 'LimitOrder' ||
              method.includes('Order') ||
              method.includes('Trade'))
          );
        });

        // 오더북 이벤트 처리
        if (orderBookEvents.length > 0) {
          console.log('오더북 이벤트 발견:', orderBookEvents);
          setDebugInfo((prev) => [
            ...prev,
            `오더북 이벤트 발견: ${orderBookEvents.length}개`,
          ]);

          // 각 이벤트 내용 처리
          orderBookEvents.forEach((e: any) => {
            if (!e.event) return;

            const { section, method, data } = e.event;
            console.log(
              `이벤트 상세: ${section}.${method}`,
              data.toHuman ? data.toHuman() : data,
            );

            // 데이터 파싱 및 업데이트 시도
            try {
              const eventData = data.toJSON();
              console.log('이벤트 데이터:', eventData);

              // 이벤트 타입별 처리
              if (method === 'Trade' || method === 'OrderExecuted') {
                // 트레이드 이벤트 처리
                setDebugInfo((prev) => [
                  ...prev,
                  `트레이드 이벤트: ${JSON.stringify(eventData).substring(0, 100)}...`,
                ]);

                // 오더북 스냅샷 데이터가 있는지 확인 및 처리
                if (eventData && typeof eventData === 'object') {
                  // 트레이드 이벤트에서 오더북 스냅샷 필드를 확인
                  // 주의: 실제 데이터 구조에 따라 수정 필요
                  if (eventData.bids && eventData.asks) {
                    updateOrderBook(eventData.bids, eventData.asks);
                  }
                }
              } else if (
                method === 'OrderPlaced' ||
                method === 'LimitOrderPlaced' ||
                method === 'LimitOrder'
              ) {
                // 신규 주문 이벤트 처리
                setDebugInfo((prev) => [
                  ...prev,
                  `주문 이벤트: ${JSON.stringify(eventData).substring(0, 100)}...`,
                ]);

                // 이벤트 후 전체 오더북 스냅샷 요청 시도
                fetchOrderBookData();
              }
            } catch (parseError) {
              console.error('이벤트 데이터 파싱 오류:', parseError);
            }
          });
        }
      });

      // 구독 해제 함수 저장
      setEventUnsubscribe(() => unsub);
      setDebugInfo((prev) => [...prev, '오더북 이벤트 구독 성공']);
    } catch (error) {
      console.error('오더북 이벤트 구독 오류:', error);
      setDebugInfo((prev) => [
        ...prev,
        `구독 오류: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  };

  // 오더북 데이터 업데이트 함수
  const updateOrderBook = (newBids: number[][], newAsks: number[][]) => {
    console.log('오더북 업데이트:', { bids: newBids, asks: newAsks });

    if (Array.isArray(newBids) && newBids.length > 0) {
      setBids(newBids);
    }

    if (Array.isArray(newAsks) && newAsks.length > 0) {
      setAsks(newAsks);
    }
  };

  // 오더북 데이터를 직접 조회하는 함수
  const fetchOrderBookData = async () => {
    try {
      setIsLoading(true);
      const api = await getPolkadotApi();

      // 디버그용 정보 설정
      setApiStatus(`연결됨: ${api.isConnected}`);
      setLastEvent(`데이터 요청: ${new Date().toLocaleTimeString()}`);

      // HybridOrderbook 모듈 쿼리 시도
      try {
        // 사용 가능한 모든 오더북 관련 API 메소드 기록
        const methods = Object.keys(api.query).filter(
          (method) =>
            method.toLowerCase().includes('hybrid') ||
            method.toLowerCase().includes('order') ||
            method.toLowerCase().includes('book'),
        );
        console.log('오더북 관련 쿼리 메소드:', methods);
        setDebugInfo((prev) => [...prev, `사용 가능한 쿼리 메소드: ${methods.join(', ')}`]);

        // 1. 오더북 데이터 조회 시도 (API에 따라 경로가 다를 수 있음)
        let orderBookData = null;

        // 1.1 hybridOrderbook 시도
        if (api.query.hybridOrderbook) {
          // 풀 정보 확인
          if (api.query.hybridOrderbook.pools) {
            const pools = await api.query.hybridOrderbook.pools.entries();
            console.log('오더북 풀 정보:', pools);
            setDebugInfo((prev) => [...prev, `풀 정보 수: ${pools.length}`]);

            if (pools.length > 0) {
              // 첫 번째 풀에서 오더북 데이터 가져오기 시도
              const poolEntry = pools[0];
              if (poolEntry && poolEntry.length >= 2) {
                const [poolIdCodec, poolInfoCodec] = poolEntry;
                const poolId = poolIdCodec.toHuman ? poolIdCodec.toHuman() : 'unknown';
                const poolInfo = poolInfoCodec.toHuman
                  ? poolInfoCodec.toHuman()
                  : 'unknown';

                console.log('첫 번째 풀 ID:', poolId, '정보:', poolInfo);
                setDebugInfo((prev) => [
                  ...prev,
                  `첫 번째 풀 ID: ${JSON.stringify(poolId).substring(0, 50)}...`,
                ]);

                // 풀 정보에서 오더북 데이터 추출 시도
                // 주의: 실제 데이터 구조에 따라 접근 방식 수정 필요
                if (poolInfoCodec.toJSON) {
                  const poolData = poolInfoCodec.toJSON();
                  console.log('풀 데이터:', poolData);

                  // 오더북 데이터가 있는지 확인
                  // 예: poolData.orderBook 또는 poolData.orders 등
                  if (
                    poolData &&
                    typeof poolData === 'object' &&
                    !Array.isArray(poolData)
                  ) {
                    // TypeScript에서 타입 단언을 사용하여 동적 접근 처리
                    const poolDataObj = poolData as Record<string, any>;
                    if (poolDataObj.orderBook) {
                      orderBookData = poolDataObj.orderBook;
                    } else if (poolDataObj.orders) {
                      orderBookData = poolDataObj.orders;
                    }
                  }
                }
              }
            }
          }

          // 1.2 직접적인 오더북 데이터 쿼리 시도
          if (api.query.hybridOrderbook.orderBook || api.query.hybridOrderbook.orders) {
            const orderBookQuery =
              api.query.hybridOrderbook.orderBook || api.query.hybridOrderbook.orders;
            const result = await orderBookQuery();
            console.log('오더북 쿼리 결과:', result);

            if (result && result.toJSON) {
              const jsonResult = result.toJSON();
              if (jsonResult && typeof jsonResult === 'object') {
                orderBookData = jsonResult;
              }
            }
          }
        }

        // 1.3 orderbook pallet 시도
        if (!orderBookData && api.query.orderbook) {
          // orderbook pallet에서 데이터 조회 시도
          if (api.query.orderbook.orders || api.query.orderbook.orderBook) {
            const orderBookQuery =
              api.query.orderbook.orders || api.query.orderbook.orderBook;
            const result = await orderBookQuery();
            console.log('orderbook 쿼리 결과:', result);

            if (result && result.toJSON) {
              const jsonResult = result.toJSON();
              if (jsonResult && typeof jsonResult === 'object') {
                orderBookData = jsonResult;
              }
            }
          }
        }

        // 2. 오더북 데이터 처리
        if (orderBookData) {
          console.log('오더북 데이터 발견:', orderBookData);
          setDebugInfo((prev) => [
            ...prev,
            `오더북 데이터 발견: ${JSON.stringify(orderBookData).substring(0, 100)}...`,
          ]);

          // 데이터 구조 분석 및 처리
          // 주의: 실제 데이터 구조에 따라 수정 필요
          if (orderBookData.bids && orderBookData.asks) {
            updateOrderBook(orderBookData.bids, orderBookData.asks);
            setError(null);
            return;
          }
        }
      } catch (queryError) {
        console.warn('오더북 쿼리 실패:', queryError);
        setDebugInfo((prev) => [
          ...prev,
          `쿼리 실패: ${queryError instanceof Error ? queryError.message : String(queryError)}`,
        ]);
      }

      // 테스트 데이터 사용 (API에서 실제 데이터를 찾지 못함)
      const testBids = [
        [100, 1],
        [99, 2],
        [98, 3],
        [97, 4],
        [96, 5],
      ];
      const testAsks = [
        [101, 1],
        [102, 2],
        [103, 3],
        [104, 4],
        [105, 5],
      ];

      updateOrderBook(testBids, testAsks);
      setDebugInfo((prev) => [...prev, `테스트 데이터 설정 (실제 API 구현 필요)`]);
      setError('API에서 실제 오더북 데이터를 찾을 수 없어 테스트 데이터를 표시합니다');
    } catch (error) {
      console.error('오더북 데이터 가져오기 실패:', error);
      setError(
        `데이터 가져오기 오류: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 초기 데이터 로드
    fetchOrderBookData();

    // 오더북 이벤트 구독 시작
    subscribeToOrderbookEvents();

    // 60초마다 데이터 업데이트 (백업용)
    const intervalId = setInterval(fetchOrderBookData, 60000);

    // 컴포넌트 언마운트 시 이벤트 구독 해제 및 인터벌 정리
    return () => {
      if (eventUnsubscribe) {
        eventUnsubscribe();
      }
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex justify-center gap-10 p-4 flex-col">
      <div className="bg-gray-800 p-4 rounded mb-4">
        <p className="text-white">API 상태: {apiStatus}</p>
        <p className="text-white">{lastEvent}</p>
        <div className="mt-2 text-xs text-gray-300 max-h-48 overflow-auto">
          {debugInfo.map((info, index) => (
            <p key={index}>{info}</p>
          ))}
        </div>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-red-500 font-bold text-lg">Asks (판매)</h2>
          {isLoading ? (
            <div className="text-gray-400">로딩 중...</div>
          ) : asks.length > 0 ? (
            <div className="flex flex-col gap-1">
              {asks.map(([price, size], index) => (
                <div
                  key={`ask-${price}-${index}`}
                  className="text-red-300 bg-red-900 bg-opacity-10 p-2 rounded flex justify-between"
                >
                  <span>${Number(price).toFixed(2)}</span>
                  <span>{Number(size)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">데이터가 없습니다</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-green-500 font-bold text-lg">Bids (구매)</h2>
          {isLoading ? (
            <div className="text-gray-400">로딩 중...</div>
          ) : bids.length > 0 ? (
            <div className="flex flex-col gap-1">
              {bids.map(([price, size], index) => (
                <div
                  key={`bid-${price}-${index}`}
                  className="text-green-300 bg-green-900 bg-opacity-10 p-2 rounded flex justify-between"
                >
                  <span>${Number(price).toFixed(2)}</span>
                  <span>{Number(size)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">데이터가 없습니다</div>
          )}
        </div>
      </div>

      <button
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        onClick={fetchOrderBookData}
      >
        오더북 새로고침
      </button>
    </div>
  );
}
