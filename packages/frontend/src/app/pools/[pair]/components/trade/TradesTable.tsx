import { EventRecord } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import React, { useEffect, useRef, useState } from 'react';

import {
  selectPoolInfo,
  usePoolDataStore,
} from '@/app/pools/[pair]/context/PoolDataContext';
import { useApi } from '@/hooks/useApi';

interface Trade {
  price: number;
  size: string;
  hash: string;
  side: 'ask' | 'bid';
  timestamp: number;
  className: string;
}

interface TokenId {
  WithId: number;
}

interface PoolId {
  base: TokenId;
  quote: TokenId;
}

interface TradeExecutedEvent {
  blockNumber: number;
  event: {
    data: {
      poolId: Array<{ WithId: string }>;
      maker: string;
      orderPrice: string;
      orderQuantity: string;
      isBid: boolean;
    };
  };
}

export default function TradesTable() {
  const { api } = useApi();
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mounted, setMounted] = useState(false);
  const prevTradesRef = useRef<Trade[]>([]);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // ask와 bid를 랜덤하게 섞는 함수
  const interleaveTrades = (asks: Trade[], bids: Trade[]): Trade[] => {
    const allTrades = [...asks, ...bids];

    // Fisher-Yates shuffle 알고리즘을 사용하여 랜덤하게 섞기
    for (let i = allTrades.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTrades[i], allTrades[j]] = [allTrades[j], allTrades[i]];
    }

    return allTrades;
  };

  // 마운트 상태 관리 (hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 기존 info로 첫 렌더링에만 trades를 채움
  useEffect(() => {
    if (!poolInfo?.asks || !poolInfo?.bids) return;
    if (firstLoaded) return; // 이미 첫 로딩 했으면 무시

    console.log('[TradesTable] Initial pool data:', {
      asks: poolInfo.asks,
      bids: poolInfo.bids,
    });

    const buildTradesFromOrders = (
      side: 'ask' | 'bid',
      orders: any,
      className: string,
    ): Trade[] => {
      const leaves = orders.leaves || {};
      const result: Trade[] = [];

      console.log(`[TradesTable] Building ${side} trades from orders:`, {
        orders,
        leaves,
        className,
      });

      // leaves 객체의 구조를 자세히 로깅
      Object.entries(leaves).forEach(([priceKey, leaf]: any) => {
        console.log(`[TradesTable] Leaf ${priceKey} structure:`, {
          leaf,
          keys: Object.keys(leaf),
          values: Object.values(leaf),
        });

        // leaf의 value 속성 확인
        if (leaf.value) {
          console.log(`[TradesTable] Leaf ${priceKey} value:`, leaf.value);
        }

        const openOrders = leaf.value?.openOrders || {};
        // priceKey를 숫자로 변환하고 10^poolDecimals로 나누어 실제 가격 계산
        const price = parseFloat(leaf.key) / Math.pow(10, poolInfo.poolDecimals ?? 2);

        console.log(`[TradesTable] Processing price ${price}:`, {
          openOrders,
          priceKey,
          leaf,
        });

        // openOrders가 객체이므로 Object.entries를 사용하여 순회
        Object.entries(openOrders).forEach(([orderId, order]: [string, any]) => {
          console.log(`[TradesTable] Processing ${side} order ${orderId}:`, order);

          // quantity에서 콤마 제거 후 숫자로 변환
          const cleanQuantity = order.quantity.replace(/,/g, '');
          const size = cleanQuantity;

          // timestamp 값 보정
          let timestamp = Number(order.expiredAt);
          if (!timestamp || isNaN(timestamp)) {
            timestamp = Number(order.expires) || Date.now();
            console.log(`[TradesTable] ${side} order timestamp adjusted:`, {
              original: order.expiredAt,
              adjusted: timestamp,
            });
          }

          const trade = {
            price,
            size,
            hash: `0x${order.owner?.slice(0, 4)}...`,
            side,
            timestamp,
            className,
          };

          console.log(`[TradesTable] ${side.toUpperCase()} Trade pushed:`, trade);
          result.push(trade);
        });
      });

      return result;
    };

    const askTrades = buildTradesFromOrders('ask', poolInfo.asks, 'text-red-400');
    const bidTrades = buildTradesFromOrders('bid', poolInfo.bids, 'text-green-400');

    console.log('[TradesTable] Built trades:', {
      askTrades,
      bidTrades,
    });

    // ask와 bid를 교차해서 섞고 최신 30개만 선택
    const interleaved = interleaveTrades(askTrades, bidTrades).slice(0, 30);

    console.log('[TradesTable] Final trades:', {
      interleaved,
      prevTrades: prevTradesRef.current,
    });

    // 이전 거래와 비교하여 변경사항이 있을 때만 업데이트
    if (JSON.stringify(interleaved) !== JSON.stringify(prevTradesRef.current)) {
      console.log('[TradesTable] Updating trades state');
      prevTradesRef.current = interleaved;
      setTrades(interleaved);
    }
    setFirstLoaded(true); // 첫 로딩 완료 표시
  }, [poolInfo?.asks, poolInfo?.bids, firstLoaded]);

  // 체결 이벤트 구독
  useEffect(() => {
    if (!api || !poolInfo?.baseAssetId || !poolInfo?.quoteAssetId) return;

    console.log('[TradesTable] Setting up event subscription for pool:', {
      baseAssetId: poolInfo.baseAssetId,
      quoteAssetId: poolInfo.quoteAssetId,
    });

    const unsubscribe = api.query.system.events((events: EventRecord[]) => {
      console.log('[TradesTable] Received events:', events.length);

      events.forEach((record: EventRecord) => {
        const { event, phase } = record;
        if (event.section === 'hybridOrderbook' && event.method === 'LimitOrder') {
          const human = event.data.toHuman() as any;
          console.log('[TradesTable] LimitOrder event:', human);

          const poolId = human.poolId;
          if (!Array.isArray(poolId) || poolId.length !== 2) {
            console.warn('[TradesTable] Invalid poolId structure:', poolId);
            return;
          }

          const base = Number(poolId[0]?.WithId ?? -1);
          const quote = Number(poolId[1]?.WithId ?? -1);

          const baseId = poolInfo.baseAssetId;
          const quoteId = poolInfo.quoteAssetId;

          console.log('[TradesTable] Comparing pool IDs:', {
            eventBaseId: base,
            eventQuoteId: quote,
            currentBaseId: baseId,
            currentQuoteId: quoteId,
          });

          if (base === baseId && quote === quoteId) {
            const cleanPrice = human.orderPrice.replace(/,/g, '');
            const cleanQuantity = human.orderQuantity.replace(/,/g, '');

            const price = parseFloat(cleanPrice) / Math.pow(10, poolInfo.poolDecimals ?? 2);
            const trade: Trade = {
              price,
              size: cleanQuantity,
              hash: `0x${human.maker.slice(0, 4)}...`,
              side: human.isBid ? 'bid' : 'ask',
              timestamp: Date.now(),
              className: human.isBid ? 'text-green-400' : 'text-red-400',
            };

            console.log('[TradesTable] New trade created:', trade);

            setTrades((prev) => {
              const newTrades = [trade, ...prev];
              const slicedTrades = newTrades.slice(0, 30);
              console.log('[TradesTable] Updated trades:', slicedTrades);
              return slicedTrades;
            });
          }
        }
      });
    }) as unknown as Promise<() => void>;

    return () => {
      console.log('[TradesTable] Cleaning up event subscription');
      unsubscribe.then((unsub) => unsub());
    };
  }, [api, poolInfo?.baseAssetId, poolInfo?.quoteAssetId]);

  // hydration 오류 방지
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-[#18181C] border border-gray-800 px-2 py-2 w-full h-full max-w-md mx-auto rounded-none flex flex-col justify-start min-h-[260px]">
      {/* 테이블 헤더 */}
      <div className="flex text-[10px] text-gray-400 w-full mb-1" style={{ minWidth: 260 }}>
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-right">Size</div>
        <div className="w-1/3 text-right">Hash</div>
      </div>

      <div className="flex flex-col w-full gap-[1px]">
        {trades.map((trade, index) => (
          <div
            key={`trade-${trade.hash}-${index}`}
            className={`relative flex text-[10px] ${trade.className} h-5 items-center w-full`}
          >
            <div className="w-1/3 relative z-10">
              {trade.price.toFixed(poolInfo?.poolDecimals ?? 4)}
            </div>
            <div className="w-1/3 text-right relative z-10">
              {Number(trade.size).toLocaleString()}
            </div>
            <div className="w-1/3 text-right relative z-10 truncate pl-1">{trade.hash}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
