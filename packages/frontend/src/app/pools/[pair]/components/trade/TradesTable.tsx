import React, { useEffect, useRef, useState } from 'react';

import {
  selectPoolInfo,
  usePoolDataStore,
} from '@/app/pools/[pair]/context/PoolDataContext';

interface Trade {
  price: number;
  size: number;
  hash: string;
}

// leaves 구조에서 실제 주문 데이터 추출하는 함수
function extractOrdersFromLeaves(poolInfo: any, count = 20): Trade[] {
  const trades: Trade[] = [];

  if (!poolInfo || (!poolInfo.asks && !poolInfo.bids)) {
    return trades; // 풀 정보가 없으면 빈 배열 반환
  }

  const poolDecimals = poolInfo.poolDecimals || 2;

  // asks와 bids 모두에서 주문 추출
  const allOrders: Trade[] = [];

  // asks에서 주문 추출
  if (poolInfo.asks && poolInfo.asks.leaves) {
    Object.entries(poolInfo.asks.leaves).forEach(([leafKey, leaf]: [string, any]) => {
      const priceStr = leaf.key?.toString().replace(/,/g, '') || '0';
      const price = parseFloat(priceStr) / Math.pow(10, poolDecimals);

      // 각 가격의 openOrders 처리
      if (leaf.value?.openOrders) {
        Object.entries(leaf.value.openOrders).forEach(
          ([orderKey, order]: [string, any]) => {
            const sizeStr = order.quantity?.toString().replace(/,/g, '') || '0';
            const size = parseFloat(sizeStr);

            // 해시값으로 주문 ID 사용 (실제 트랜잭션 해시가 아님)
            const hash = `0x${orderKey.substring(0, 8)}`;

            allOrders.push({ price, size, hash });
          },
        );
      }
    });
  }

  // bids에서 주문 추출
  if (poolInfo.bids && poolInfo.bids.leaves) {
    Object.entries(poolInfo.bids.leaves).forEach(([leafKey, leaf]: [string, any]) => {
      const priceStr = leaf.key?.toString().replace(/,/g, '') || '0';
      const price = parseFloat(priceStr) / Math.pow(10, poolDecimals);

      // 각 가격의 openOrders 처리
      if (leaf.value?.openOrders) {
        Object.entries(leaf.value.openOrders).forEach(
          ([orderKey, order]: [string, any]) => {
            const sizeStr = order.quantity?.toString().replace(/,/g, '') || '0';
            const size = parseFloat(sizeStr);

            // 해시값으로 주문 ID 사용
            const hash = `0x${orderKey.substring(0, 8)}`;

            allOrders.push({ price, size, hash });
          },
        );
      }
    });
  }

  // 무작위로 섞어서 트레이드 히스토리처럼 보이게 함
  allOrders.sort(() => Math.random() - 0.5);

  // 요청된 개수만큼 반환
  return allOrders.slice(0, count);
}

export default function TradesTable() {
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const prevOrdersHashRef = useRef<string>('empty');

  // leaves 해시 생성 (변경 감지용)
  const createLeavesHash = (data: any) => {
    if (!data || !data.leaves || Object.keys(data.leaves).length === 0) {
      return 'empty';
    }

    return Object.keys(data.leaves)
      .map((key) => `${key}:${JSON.stringify(data.leaves[key].key)}`)
      .sort()
      .join('|');
  };

  // 풀 정보가 로드되면 트레이드 데이터 추출
  useEffect(() => {
    if (!poolInfo) return;

    if (poolInfo.poolPrice) {
      setBasePrice(poolInfo.poolPrice);
    }

    // asks와 bids 해시 결합하여 변경 감지
    const currentAsksHash = poolInfo.asks ? createLeavesHash(poolInfo.asks) : 'empty';
    const currentBidsHash = poolInfo.bids ? createLeavesHash(poolInfo.bids) : 'empty';
    const combinedHash = `${currentAsksHash}|${currentBidsHash}`;

    // 해시가 변경된 경우만 데이터 다시 추출
    if (combinedHash !== prevOrdersHashRef.current) {
      console.log('오더북 데이터가 변경되어 트레이드 이력을 업데이트합니다');
      prevOrdersHashRef.current = combinedHash;

      const extractedTrades = extractOrdersFromLeaves(poolInfo, 20);
      setTrades(extractedTrades);
    }
  }, [poolInfo]);

  // 주기적으로 트레이드 목록 갱신
  useEffect(() => {
    if (!poolInfo) return;

    const interval = setInterval(() => {
      // 기존 트레이드에서 일부만 유지하고, 새 트레이드 추가
      setTrades((prevTrades) => {
        if (prevTrades.length === 0) return prevTrades;

        // 현재 배열에서 무작위로 요소 하나 제거하고, 새 위치에 추가
        const newTrades = [...prevTrades];
        const randomIndex = Math.floor(Math.random() * newTrades.length);
        const removedTrade = newTrades.splice(randomIndex, 1)[0];

        // 약간 변형된 가격으로 새 위치에 삽입
        const priceAdjustment = (Math.random() * 0.01 - 0.005) * removedTrade.price;
        const modifiedTrade = {
          ...removedTrade,
          price: +(removedTrade.price + priceAdjustment).toFixed(4),
          hash: `0x${Math.random().toString(16).substring(2, 8)}`,
        };

        // 제일 앞에 추가 (최신 트레이드가 위에 표시)
        return [modifiedTrade, ...newTrades];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [poolInfo]);

  return (
    <div className="bg-[#18181C] border border-gray-800 px-2 py-2 w-full h-full flex-1 mx-auto rounded-none flex flex-col justify-start min-h-[260px]">
      {/* 테이블 헤더 */}
      <div className="flex text-xs text-gray-400 w-full mb-1" style={{ minWidth: 260 }}>
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-right">Size</div>
        <div className="w-1/3 text-right">Hash</div>
      </div>
      {/* 트레이드 데이터 */}
      <div className="flex flex-col w-full gap-[1px] overflow-y-auto flex-1">
        {trades.map((trade, i) => (
          <div
            key={i}
            className={`flex text-sm h-5 items-center w-full ${basePrice && trade.price >= basePrice ? 'text-green-400' : 'text-red-400'}`}
          >
            <div className="w-1/3">{trade.price.toFixed(4)}</div>
            <div className="w-1/3 text-right">{trade.size.toFixed(2)}</div>
            <div className="w-1/3 text-right text-gray-400 text-xs">{trade.hash}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
