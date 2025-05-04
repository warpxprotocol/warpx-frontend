'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';

import AMMInfoBox from '@/app/pools/[pair]/AMMInfoBox';
import {
  selectLoading,
  selectPoolInfo,
  usePoolDataFetcher,
  usePoolDataStore,
} from '@/app/pools/[pair]/context/PoolDataContext';

// 오더북 데이터 타입
interface Order {
  price: number;
  size: number;
  total: number; // price x size (주문 가치)
  cumulative?: number; // 누적 수량 (선택적)
}

// 큰 숫자를 읽기 쉽게 포맷팅하는 유틸리티 함수
function formatNumber(num: number): string {
  // 1,000,000,000 -> 1.00
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2);
  }
  // 1,000,000 -> 1.00
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2);
  }
  // 1,000 -> 1.00
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2);
  }
  // 작은 수는 소수점 2자리까지
  return num.toFixed(2);
}

// API 오더북 데이터를 Order[] 형태로 변환하는 함수
function convertOrderBookData(
  orderBookData: Record<string, any>,
  orderType: 'ask' | 'bid',
): Order[] {
  const result: Order[] = [];
  let cumulativeTotal = 0;

  try {
    // console.log(`${orderType} orderbook data:`, orderBookData);

    // 데이터가 없으면 빈 배열 반환
    if (!orderBookData) {
      // console.log(`${orderType} orderbook data is null or undefined`);
      return [];
    }

    // 데이터 구조 분석을 위한 로깅
    // console.log(`${orderType} orderbook 키:`, Object.keys(orderBookData));

    // leaves 객체가 없거나 비어있으면 빈 배열 반환
    if (!orderBookData.leaves || Object.keys(orderBookData.leaves).length === 0) {
      // console.log(`${orderType} orderbook leaves is empty or missing`);

      // 다른 형태의 데이터가 있는지 확인
      if (orderType === 'ask' && orderBookData.asks) {
        // console.log(`Using nested 'asks' data:`, orderBookData.asks);
        return convertOrderBookData(orderBookData.asks, orderType);
      }

      if (orderType === 'bid' && orderBookData.bids) {
        // console.log(`Using nested 'bids' data:`, orderBookData.bids);
        return convertOrderBookData(orderBookData.bids, orderType);
      }

      return [];
    }

    // leaves 객체에서 key를 추출하고 정렬
    const prices = Object.values(orderBookData.leaves).map((leaf: any) => {
      // key가 문자열인 경우 콤마 제거하고 숫자로 변환
      const keyStr = String(leaf.key).replace(/,/g, '');
      return parseFloat(keyStr);
    });

    // console.log(`${orderType} extracted prices:`, prices);

    // 정렬 방향 설정
    let sortedPrices;
    if (orderType === 'ask') {
      // asks는 오름차순 정렬 (낮은 가격이 위로)
      sortedPrices = prices.sort((a, b) => a - b);
    } else {
      // bids는 내림차순 정렬 (높은 가격이 위로)
      sortedPrices = prices.sort((a, b) => b - a);
    }

    // console.log(`${orderType} sorted prices:`, sortedPrices);

    // 정렬된 가격 순서대로 주문 정보 생성
    for (const price of sortedPrices) {
      // price에 해당하는 leaf 노드 찾기 - 문자열 비교를 위해 toString() 사용
      const leafNodeKey = Object.keys(orderBookData.leaves).find((key) => {
        const leafKey = String(orderBookData.leaves[key].key).replace(/,/g, '');
        const priceKey = price.toString();
        return leafKey === priceKey;
      });

      if (!leafNodeKey) {
        // console.log(`Leaf node not found for price ${price}`);
        continue;
      }

      const leaf = orderBookData.leaves[leafNodeKey];
      const openOrders = leaf.value?.openOrders || {};

      // 해당 가격의 모든 주문 수량 합계
      let totalQuantity = 0;
      const orderCount = Object.keys(openOrders).length;

      Object.values(openOrders).forEach((order: any) => {
        // 콤마 제거 후 숫자로 변환
        const quantityStr = String(order.quantity).replace(/,/g, '');
        const orderQuantity = parseFloat(quantityStr);
        totalQuantity += orderQuantity;

        // 주문 상세 정보 로깅 (개발 시에만)
        // console.log(
        //   `  - 주문 수량: ${formatNumber(orderQuantity)}, 만료: ${order.expiredAt}`,
        // );
      });

      // 수량이 0인 경우 스킵
      if (totalQuantity <= 0) {
        // console.log(`Skipping price ${price} with zero quantity`);
        continue;
      }

      // 실제 가격은 정수형 key를 poolDecimals에 맞게 나눈 값
      // 여기서는 2를 하드코딩했지만, 실제로는 poolInfo.poolDecimals를 사용하는 것이 좋음
      const poolDecimals = 2;
      const adjustedPrice = price / Math.pow(10, poolDecimals);

      cumulativeTotal += totalQuantity;

      const orderItem = {
        price: adjustedPrice,
        size: totalQuantity,
        total: adjustedPrice * totalQuantity, // 가격 x 수량 = 주문 가치
        cumulative: cumulativeTotal, // 누적 수량은 별도 필드로 저장
      };

      // console.log(
      //   `  [${orderType.toUpperCase()}] 가격: ${adjustedPrice}, 수량: ${formatNumber(totalQuantity)}, 가치: ${formatNumber(adjustedPrice * totalQuantity)}`,
      // );

      result.push(orderItem);
    }

    // console.log(
    //   `Converted ${orderType} orders (${result.length} items):`,
    //   result
    //     .map(
    //       (o) =>
    //         `{price: ${o.price}, size: ${formatNumber(o.size)}, total: ${formatNumber(o.total)}}`,
    //     )
    //     .join('\n'),
    // );
    return result;
  } catch (error) {
    // console.error(`Error converting ${orderType} orderbook data:`, error);
    return [];
  }
}

// 오더북 데이터의 해시 생성 함수 (변경 감지용)
function createOrderbookHash(data: any) {
  if (!data) {
    return 'empty';
  }

  try {
    // 데이터 구조에 따라 다른 방식으로 해시 생성
    if (data.leaves && Object.keys(data.leaves).length > 0) {
      // leaves 구조가 있는 경우, 주문 수량과 만료 정보까지 포함
      return Object.entries(data.leaves)
        .map(([key, leaf]: [string, any]) => {
          const openOrders = leaf.value?.openOrders || {};
          const ordersInfo = Object.entries(openOrders)
            .map(([orderId, order]: [string, any]) => {
              // 각 주문의 수량과 만료 정보까지 포함
              const quantity = order.quantity || '0';
              const expiry = order.expiredAt || '0';
              return `${orderId}:${quantity}:${expiry}`;
            })
            .join(',');

          // 기존 키(가격) 정보에 주문 정보 추가
          return `${key}:${JSON.stringify(leaf.key)}:${ordersInfo}`;
        })
        .sort()
        .join('|');
    } else if (data.internalNodes) {
      // 다른 구조가 있는 경우 - 내부 노드까지 고려
      const internalNodesHash = Object.entries(data.internalNodes)
        .map(([key, node]: [string, any]) => {
          return `${key}:${JSON.stringify(node)}`;
        })
        .join('|');
      return `internal:${internalNodesHash}`;
    } else {
      // 다른 모든 경우 - deep stringify로 변경 사항 감지 강화
      return `json:${JSON.stringify(data)}`.substring(0, 200); // 너무 길지 않게 제한
    }
  } catch (error) {
    // console.error('해시 생성 중 오류 발생:', error);
    // 에러가 발생해도 매번 다른 해시를 반환하여 업데이트가 일어나도록 함
    return `error:${Date.now()}`;
  }
}

// 훅 호출을 포함하지 않는 일반 함수로 수정
function generateOrders(
  type: 'ask' | 'bid',
  basePrice: number,
  reserve0: number,
  reserve1: number,
  count = 10,
): Order[] {
  let orders: Order[] = [];
  let total = 0;
  const sign = type === 'ask' ? 1 : -1;

  for (let i = 0; i < count; i++) {
    // 실제 가격에서 시작해서 위/아래로 spread
    const price = +(basePrice + sign * i * (basePrice * 0.003)).toFixed(4);
    // 물량은 실제 reserve에 비례하게 - 랜덤성 추가
    const amount =
      type === 'ask'
        ? Math.floor(reserve0 * 0.01 * (1 + Math.random() * 0.5))
        : Math.floor(reserve1 * 0.01 * (1 + Math.random() * 0.5));

    total += amount;
    orders.push({ price, size: amount, total: price * amount });
  }
  return orders;
}

function OrderbookTable() {
  usePoolDataFetcher();

  const [mounted, setMounted] = useState(false);
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);

  // 이전 데이터 해시를 저장하기 위한 ref
  const prevAsksHashRef = useRef<string>('empty');
  const prevBidsHashRef = useRef<string>('empty');

  // 풀 데이터 가져오기
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const loading = usePoolDataStore(selectLoading);
  const poolDecimals = poolInfo?.poolDecimals ?? 4;

  // 마운트 시 초기화
  useEffect(() => {
    setMounted(true);
  }, []);

  // poolInfo 변경 시 데이터 업데이트
  useEffect(() => {
    if (!poolInfo) {
      // 풀 정보가 없는 경우 빈 배열 사용
      setAsks([]);
      setBids([]);
      return;
    }

    // 데이터 로그 추가
    // console.log('현재 orderbook 데이터:', { asks: poolInfo.asks, bids: poolInfo.bids });

    // 현재 asks/bids 해시 계산
    const currentAsksHash = poolInfo.asks ? createOrderbookHash(poolInfo.asks) : 'empty';
    const currentBidsHash = poolInfo.bids ? createOrderbookHash(poolInfo.bids) : 'empty';

    // console.log('해시값:', {
    //   currentAsksHash,
    //   prevAsksHash: prevAsksHashRef.current,
    //   currentBidsHash,
    //   prevBidsHash: prevBidsHashRef.current,
    // });

    // asks 데이터 처리 - 항상 최신 데이터로 변환 시도
    if (poolInfo.asks) {
      const convertedAsks = convertOrderBookData(poolInfo.asks, 'ask');
      // 변환된 데이터가 있거나 이전 해시와 다른 경우에만 업데이트
      if (convertedAsks.length > 0 || currentAsksHash !== prevAsksHashRef.current) {
        // console.log(
        //   'asks 데이터가 변경되어 업데이트합니다:',
        //   convertedAsks.length,
        //   '개 항목',
        // );
        prevAsksHashRef.current = currentAsksHash;
        setAsks(convertedAsks);
      }
    }

    // bids 데이터 처리 - 항상 최신 데이터로 변환 시도
    if (poolInfo.bids) {
      const convertedBids = convertOrderBookData(poolInfo.bids, 'bid');
      // 변환된 데이터가 있거나 이전 해시와 다른 경우에만 업데이트
      if (convertedBids.length > 0 || currentBidsHash !== prevBidsHashRef.current) {
        // console.log(
        //   'bids 데이터가 변경되어 업데이트합니다:',
        //   convertedBids.length,
        //   '개 항목',
        // );
        prevBidsHashRef.current = currentBidsHash;
        setBids(convertedBids);
      }
    }
  }, [poolInfo]);

  // 최대 total 값 계산 (각각)
  const maxAskTotal = Math.max(...asks.map((a) => a.total), 1);
  const maxBidTotal = Math.max(...bids.map((b) => b.total), 1);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-[#18181C] border border-gray-800 px-2 py-2 w-full h-full max-w-md mx-auto rounded-none flex flex-col justify-start min-h-[260px]">
      {/* 테이블 헤더 */}
      <div className="flex text-xs text-gray-400 w-full mb-1" style={{ minWidth: 260 }}>
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-right">Size</div>
        <div className="w-1/3 text-right">Total</div>
      </div>

      <div className="flex flex-col w-full gap-[1px] max-h-[220px] overflow-y-auto">
        {[...asks].reverse().map((ask, i) => (
          <div
            key={`ask-${ask.price}-${i}`}
            className="relative flex text-sm text-red-400 h-5 items-center w-full"
          >
            {/* 색상 바 */}
            <div
              className="absolute left-0 top-0 h-full bg-red-500 opacity-20 rounded"
              style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
            />
            <div className="w-1/3 relative z-10">{ask.price.toFixed(poolDecimals)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(ask.size)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(ask.total)}</div>
          </div>
        ))}
      </div>

      <div className="flex w-full my-1">
        <AMMInfoBox />
      </div>

      <div className="flex flex-col w-full gap-[1px]">
        {bids.map((bid, i) => (
          <div
            key={`bid-${bid.price}-${i}`}
            className="relative flex text-sm text-green-400 h-5 items-center w-full"
          >
            {/* 색상 바 */}
            <div
              className="absolute left-0 top-0 h-full bg-green-500 opacity-20 rounded"
              style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
            />
            <div className="w-1/3 relative z-10">{bid.price.toFixed(poolDecimals)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(bid.size)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(bid.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Create a dynamic import of the OrderbookTable component with no SSR
const OrderbookTableClient = dynamic(() => Promise.resolve(OrderbookTable), {
  ssr: false,
});

export default function OrderbookTableWrapper() {
  return <OrderbookTableClient />;
}
