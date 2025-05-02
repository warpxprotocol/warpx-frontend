import React, { useEffect, useRef, useState } from 'react';

import {
  selectPoolInfo,
  usePoolDataStore,
} from '@/app/pools/[pair]/context/PoolDataContext';

interface Trade {
  price: number;
  size: string;
  hash: string;
  side: 'ask' | 'bid';
  timestamp: number;
  className: string;
}

/**
 * 오더북 데이터로부터 거래 내역을 추출하는 함수
 * @param poolInfo 풀 정보 (오더북 데이터 포함)
 * @param previousHash 이전 해시값 (변경점 확인용)
 * @param count 반환할 거래 수
 * @returns 거래 내역 배열과 해시값
 */
function extractTradesFromOrderBook(
  poolInfo: any,
  previousHash: string = '',
  count = 20,
): { trades: Trade[]; hash: string } {
  if (!poolInfo || (!poolInfo.asks && !poolInfo.bids)) {
    return { trades: [], hash: 'empty' };
  }

  const result: Trade[] = [];
  const poolDecimals = Number(poolInfo.poolDecimals || 2);
  const now = Date.now();

  // 해시 생성 함수 (poolInfo 변경 감지용)
  const createHash = () => {
    try {
      let asksHash = 'empty';
      let bidsHash = 'empty';

      if (poolInfo.asks?.leaves) {
        const askLeaves = Object.values(poolInfo.asks.leaves);
        const askKeys = askLeaves
          .map((leaf: any) => leaf.key)
          .sort()
          .join('|');
        asksHash = `asks:${askKeys}`;
      }

      if (poolInfo.bids?.leaves) {
        const bidLeaves = Object.values(poolInfo.bids.leaves);
        const bidKeys = bidLeaves
          .map((leaf: any) => leaf.key)
          .sort()
          .join('|');
        bidsHash = `bids:${bidKeys}`;
      }

      return `${asksHash}|${bidsHash}`;
    } catch (e) {
      console.error('[TradesTable] 해시 생성 오류:', e);
      return `error:${Date.now()}`;
    }
  };

  // asks와 bids를 함께 처리하는 함수
  const processOrders = (orderBook: any, side: 'ask' | 'bid') => {
    if (!orderBook || !orderBook.leaves) return;

    const leaves = Object.values(orderBook.leaves);

    for (const leaf of leaves) {
      if (!leaf || !leaf.value || !leaf.value.openOrders) continue;

      // 가격 정보 추출
      const priceStr = String(leaf.key).replace(/,/g, '');
      const price = parseFloat(priceStr) / Math.pow(10, poolDecimals);

      // openOrders에서 주문 정보 추출
      const openOrders = leaf.value.openOrders;
      const orderKeys = Object.keys(openOrders);

      for (const orderKey of orderKeys) {
        const order = openOrders[orderKey];
        if (!order) continue;

        // 주문 수량 처리 - 원본 값 그대로 사용
        const size = order.quantity?.toString() || '0';

        // 해시값 설정 (owner 필드 사용)
        const hash = order.owner
          ? `0x${order.owner.substring(0, 15)}`
          : `0x${orderKey.substring(0, 15)}`;

        // 타임스탬프 - expiresAt 또는 orderKey로부터 추정
        let timestamp = now;
        if (order.expiredAt) {
          const expiredAtStr = String(order.expiredAt).replace(/,/g, '');
          timestamp = now - parseInt(expiredAtStr) * 1000;
        } else {
          // 랜덤하게 1~30분 전 타임스탬프 생성
          timestamp = now - (Math.floor(Math.random() * 30) + 1) * 60 * 1000;
        }

        // 색상 지정
        const className = side === 'ask' ? 'text-red-400' : 'text-green-400';

        // 트레이드 객체 생성
        result.push({
          price,
          size,
          hash,
          side,
          timestamp,
          className,
        });

        // 충분한 거래가 생성되면 중단
        if (result.length >= count) {
          return;
        }
      }
    }
  };

  // asks와 bids 모두 처리
  processOrders(poolInfo.asks, 'ask');
  processOrders(poolInfo.bids, 'bid');

  // 타임스탬프 기준으로 최신 거래가 위로 오도록 정렬
  result.sort((a, b) => b.timestamp - a.timestamp);

  // 해시값과 함께 결과 반환
  return {
    trades: result.slice(0, count),
    hash: createHash(),
  };
}

export default function TradesTable() {
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mounted, setMounted] = useState(false);
  const prevHashRef = useRef<string>('empty');

  // 마운트 상태 관리 (hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // poolInfo 변경 감지 및 거래 데이터 추출
  useEffect(() => {
    if (!poolInfo) return;

    // 오더북에서 거래 내역 추출
    const { trades: newTrades, hash: newHash } = extractTradesFromOrderBook(
      poolInfo,
      prevHashRef.current,
    );

    // 새로운 해시가 이전과 다른 경우에만 거래 내역 업데이트
    if (newHash !== prevHashRef.current && newTrades.length > 0) {
      console.log('[TradesTable] 거래 데이터 업데이트:', newTrades.length, '개 항목');
      setTrades(newTrades);
      prevHashRef.current = newHash;
    }
  }, [poolInfo]);

  // 주기적인 데이터 업데이트 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!poolInfo) return;

      const { trades: newTrades, hash: newHash } = extractTradesFromOrderBook(
        poolInfo,
        prevHashRef.current,
      );

      if (newHash !== prevHashRef.current && newTrades.length > 0) {
        console.log('[TradesTable] 주기적 업데이트:', newTrades.length, '개 항목');
        setTrades(newTrades);
        prevHashRef.current = newHash;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [poolInfo]);

  // hydration 오류 방지
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-[#18181C] border border-gray-800 px-2 py-2 w-full h-full max-w-md mx-auto rounded-none flex flex-col justify-start min-h-[260px]">
      {/* 테이블 헤더 */}
      <div className="flex text-xs text-gray-400 w-full mb-1" style={{ minWidth: 260 }}>
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-right">Size</div>
        <div className="w-1/3 text-right">Hash</div>
      </div>

      <div className="flex flex-col w-full gap-[1px]">
        {trades.map((trade, index) => (
          <div
            key={`trade-${trade.hash}-${index}`}
            className={`relative flex text-sm ${trade.className} h-5 items-center w-full`}
          >
            <div className="w-1/3 relative z-10">{trade.price.toFixed(4)}</div>
            <div className="w-1/3 text-right relative z-10">{trade.size}</div>
            <div className="w-1/3 text-right relative z-10 truncate">
              {trade.hash.slice(0, 6)}
            </div>
          </div>
        ))}

        {/* 거래 내역이 없을 때 빈 행 표시 */}
        {trades.length === 0 &&
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={`empty-${i}`}
                className="relative flex text-sm text-gray-700 h-5 items-center w-full"
              >
                <div className="w-1/3 relative z-10 opacity-50">-</div>
                <div className="w-1/3 text-right relative z-10 opacity-50">-</div>
                <div className="w-1/3 text-right relative z-10 opacity-50">-</div>
              </div>
            ))}
      </div>
    </div>
  );
}
