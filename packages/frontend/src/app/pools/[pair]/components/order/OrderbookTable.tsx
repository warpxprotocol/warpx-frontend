import React, { useEffect, useRef, useState } from 'react';

import AMMInfoBox from '@/app/pools/[pair]/AMMInfoBox';
import {
  selectLoading,
  selectPoolInfo,
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
    console.log(`${orderType} orderbook data:`, orderBookData);

    // leaves 객체가 없거나 비어있으면 빈 배열 반환
    if (
      !orderBookData ||
      !orderBookData.leaves ||
      Object.keys(orderBookData.leaves).length === 0
    ) {
      console.log(`${orderType} orderbook leaves is empty`);
      return [];
    }

    // leaves 객체에서 key를 추출하고 정렬
    const prices = Object.values(orderBookData.leaves).map((leaf: any) => {
      // key가 문자열인 경우 콤마 제거하고 숫자로 변환
      const keyStr = String(leaf.key).replace(/,/g, '');
      return parseFloat(keyStr);
    });

    console.log(`${orderType} extracted prices:`, prices);

    // 두 경우 모두 내림차순 정렬 (높은 가격이 위로 가도록)
    const sortedPrices = prices.sort((a, b) => b - a);

    console.log(`${orderType} sorted prices:`, sortedPrices);

    // 정렬된 가격 순서대로 주문 정보 생성
    for (const price of sortedPrices) {
      // price에 해당하는 leaf 노드 찾기 - 문자열 비교를 위해 toString() 사용
      const leafNodeKey = Object.keys(orderBookData.leaves).find((key) => {
        const leafKey = String(orderBookData.leaves[key].key).replace(/,/g, '');
        const priceKey = price.toString();
        return leafKey === priceKey;
      });

      if (!leafNodeKey) {
        console.log(`Leaf node not found for price ${price}`);
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
        console.log(
          `  - 주문 수량: ${formatNumber(orderQuantity)}, 만료: ${order.expiredAt}`,
        );
      });

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

      console.log(
        `  [${orderType.toUpperCase()}] 가격: ${adjustedPrice}, 수량: ${formatNumber(totalQuantity)}, 가치: ${formatNumber(adjustedPrice * totalQuantity)}`,
      );

      result.push(orderItem);
    }

    console.log(
      `Converted ${orderType} orders (${result.length} items):`,
      result
        .map(
          (o) =>
            `{price: ${o.price}, size: ${formatNumber(o.size)}, total: ${formatNumber(o.total)}}`,
        )
        .join('\n'),
    );
    return result;
  } catch (error) {
    console.error(`Error converting ${orderType} orderbook data:`, error);
    return [];
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

export default function OrderbookTable() {
  const [mounted, setMounted] = useState(false);
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);

  // 이전 데이터 해시를 저장하기 위한 ref
  const prevAsksHashRef = useRef<string>('empty');
  const prevBidsHashRef = useRef<string>('empty');

  // 풀 데이터 가져오기
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const loading = usePoolDataStore(selectLoading);

  useEffect(() => {
    setMounted(true);

    // 초기 데이터
    if (poolInfo) {
      // asks와 bids 데이터 변경 확인을 위한 해시 생성
      const createOrderbookHash = (data: any) => {
        if (!data || !data.leaves || Object.keys(data.leaves).length === 0) {
          return 'empty';
        }
        return Object.keys(data.leaves)
          .map((key) => `${key}:${JSON.stringify(data.leaves[key].key)}`)
          .sort()
          .join('|');
      };

      // 현재 asks/bids 해시 계산
      const currentAsksHash = poolInfo.asks ? createOrderbookHash(poolInfo.asks) : 'empty';
      const currentBidsHash = poolInfo.bids ? createOrderbookHash(poolInfo.bids) : 'empty';

      // 이전 해시와 비교하여 변경된 경우만 데이터 변환
      if (currentAsksHash !== prevAsksHashRef.current) {
        console.log('asks 데이터가 변경되어 업데이트합니다');
        prevAsksHashRef.current = currentAsksHash;

        const convertedAsks = convertOrderBookData(poolInfo.asks, 'ask');
        setAsks(convertedAsks);
      }

      if (currentBidsHash !== prevBidsHashRef.current) {
        console.log('bids 데이터가 변경되어 업데이트합니다');
        prevBidsHashRef.current = currentBidsHash;

        const convertedBids = convertOrderBookData(poolInfo.bids, 'bid');
        setBids(convertedBids);
      }
    } else {
      // 풀 정보가 없는 경우 빈 배열 사용
      setAsks([]);
      setBids([]);
    }

    // 주기적 업데이트
    const interval = setInterval(() => {
      if (poolInfo && poolInfo.poolExists) {
        // asks와 bids 데이터 변경 확인을 위한 해시 생성
        const createOrderbookHash = (data: any) => {
          if (!data || !data.leaves || Object.keys(data.leaves).length === 0) {
            return 'empty';
          }
          return Object.keys(data.leaves)
            .map((key) => `${key}:${JSON.stringify(data.leaves[key].key)}`)
            .sort()
            .join('|');
        };

        // 현재 asks/bids 해시 계산
        const currentAsksHash = poolInfo.asks
          ? createOrderbookHash(poolInfo.asks)
          : 'empty';
        const currentBidsHash = poolInfo.bids
          ? createOrderbookHash(poolInfo.bids)
          : 'empty';

        // 이전 해시와 비교하여 변경된 경우만 데이터 변환
        if (currentAsksHash !== prevAsksHashRef.current) {
          console.log('asks 데이터가 변경되어 업데이트합니다');
          prevAsksHashRef.current = currentAsksHash;

          const convertedAsks = convertOrderBookData(poolInfo.asks, 'ask');
          setAsks(convertedAsks);
        }

        if (currentBidsHash !== prevBidsHashRef.current) {
          console.log('bids 데이터가 변경되어 업데이트합니다');
          prevBidsHashRef.current = currentBidsHash;

          const convertedBids = convertOrderBookData(poolInfo.bids, 'bid');
          setBids(convertedBids);
        }
      } else {
        // 풀 정보가 없는 경우 빈 배열 유지
        // 임의 데이터 생성 로직 주석 처리
        /*
        setAsks(getRandomOrders('ask', 10));
        setBids(getRandomOrders('bid', 10));
        */
      }
    }, 5000);

    return () => clearInterval(interval);
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
      {/* 매도(ASKS) - 위쪽 */}
      <div className="flex flex-col w-full gap-[1px]">
        {asks.map((ask, i) => (
          <div
            key={i}
            className="relative flex text-sm text-red-400 h-5 items-center w-full"
          >
            {/* 색상 바 */}
            <div
              className="absolute left-0 top-0 h-full bg-red-500 opacity-20 rounded"
              style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
            />
            <div className="w-1/3 relative z-10">{ask.price.toFixed(4)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(ask.size)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(ask.total)}</div>
          </div>
        ))}
      </div>
      {/* AMMInfoBox 중앙 배치 - 테이블 컬럼에 맞춰 한 줄로 */}
      <div className="flex w-full my-1">
        <AMMInfoBox />
      </div>
      {/* 매수(BIDS) - 아래쪽 */}
      <div className="flex flex-col w-full gap-[1px]">
        {bids.map((bid, i) => (
          <div
            key={i}
            className="relative flex text-sm text-green-400 h-5 items-center w-full"
          >
            {/* 색상 바 */}
            <div
              className="absolute left-0 top-0 h-full bg-green-500 opacity-20 rounded"
              style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
            />
            <div className="w-1/3 relative z-10">{bid.price.toFixed(4)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(bid.size)}</div>
            <div className="w-1/3 text-right relative z-10">{formatNumber(bid.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
