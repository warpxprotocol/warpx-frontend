import React, { useEffect, useState } from 'react';

import AMMInfoBox from '@/app/pools/[pair]/AMMInfoBox';
import {
  selectLoading,
  selectPoolInfo,
  usePoolDataStore,
} from '@/app/pools/[pair]/context/PoolDataContext';

// 오더북 데이터 타입
interface Order {
  price: number;
  amount: number;
  total: number;
}

// 테스트 용도로 사용하던 더미 데이터 생성 함수 (주석 처리)
/*
function getRandomOrders(type: 'ask' | 'bid', count = 10): Order[] {
  let base = type === 'ask' ? 4.08 : 4.07;
  let sign = type === 'ask' ? 1 : -1;
  let orders: Order[] = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const price = +(base + sign * i * 0.01).toFixed(2);
    const amount = Math.floor(Math.random() * 100 + 50);
    total += amount;
    orders.push({ price, amount, total });
  }
  return orders;
}
*/

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
    orders.push({ price, amount, total });
  }
  return orders;
}

export default function OrderbookTable() {
  const [mounted, setMounted] = useState(false);
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);

  // 풀 데이터 가져오기
  const poolInfo = usePoolDataStore(selectPoolInfo);
  const loading = usePoolDataStore(selectLoading);

  useEffect(() => {
    setMounted(true);

    // 초기 데이터
    if (poolInfo) {
      // 실제 가격 설정을 위한 중간 가격 계산
      const midPrice =
        poolInfo.poolExists && poolInfo.reserve0 > 0 && poolInfo.reserve1 > 0
          ? poolInfo.reserve1 / poolInfo.reserve0
          : 4.0; // 기본값

      // API에서 받은 실제 asks, bids 데이터가 있는지 확인
      const poolData = poolInfo as any; // 타입 확장을 위한 임시 캐스팅

      if (
        poolData.asks &&
        poolData.asks.leaves &&
        Object.keys(poolData.asks.leaves).length > 0
      ) {
        // 실제 asks 데이터가 있는 경우 처리
        console.log('실제 asks 데이터 사용:', poolData.asks);
        // 여기서 실제 asks 데이터를 Order[] 형태로 변환하는 로직 구현 필요
        // setAsks(convertedAsks);
      } else {
        // 임시: 빈 배열 설정 (더미 데이터 생성 대신)
        setAsks([]);
        /* 
        // 임시 데이터 생성 (기존 코드) - 주석 처리
        setAsks(generateOrders('ask', midPrice, poolInfo.reserve0, poolInfo.reserve1, 10)); 
        */
      }

      if (
        poolData.bids &&
        poolData.bids.leaves &&
        Object.keys(poolData.bids.leaves).length > 0
      ) {
        // 실제 bids 데이터가 있는 경우 처리
        console.log('실제 bids 데이터 사용:', poolData.bids);
        // 여기서 실제 bids 데이터를 Order[] 형태로 변환하는 로직 구현 필요
        // setBids(convertedBids);
      } else {
        // 임시: 빈 배열 설정 (더미 데이터 생성 대신)
        setBids([]);
        /*
        // 임시 데이터 생성 (기존 코드) - 주석 처리
        setBids(generateOrders('bid', midPrice, poolInfo.reserve0, poolInfo.reserve1, 10));
        */
      }
    } else {
      // 풀 정보가 없는 경우 빈 배열 사용
      setAsks([]);
      setBids([]);
      /*
      // 풀 정보가 없으면 임의 데이터 사용 (기존 코드) - 주석 처리
      setAsks(getRandomOrders('ask', 10));
      setBids(getRandomOrders('bid', 10));
      */
    }

    // 주기적 업데이트
    const interval = setInterval(() => {
      if (poolInfo && poolInfo.poolExists) {
        // API에서 받은 실제 asks, bids 데이터 확인
        const poolData = poolInfo as any; // 타입 확장을 위한 임시 캐스팅

        if (poolData.asks && poolData.asks.leaves) {
          // 실제 데이터 업데이트 로직
          console.log('주기적 업데이트: 실제 asks 데이터');
          // 데이터 변환 및 업데이트 로직 필요
        }

        if (poolData.bids && poolData.bids.leaves) {
          // 실제 데이터 업데이트 로직
          console.log('주기적 업데이트: 실제 bids 데이터');
          // 데이터 변환 및 업데이트 로직 필요
        }

        /*
        // 기존 임의 업데이트 로직 (주석 처리)
        const midPrice = poolInfo.reserve1 / poolInfo.reserve0;
        setAsks((prevAsks) => {
          return prevAsks.map((ask) => ({
            ...ask,
            price: +(midPrice + (ask.price - prevAsks[0].price)).toFixed(4),
          }));
        });
        setBids((prevBids) => {
          return prevBids.map((bid) => ({
            ...bid,
            price: +(midPrice - (prevBids[0].price - bid.price)).toFixed(4),
          }));
        });
        */
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
        <div className="w-1/3 text-right">Amount</div>
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
            <div className="w-1/3 text-right relative z-10">{ask.amount}</div>
            <div className="w-1/3 text-right relative z-10">{ask.total}</div>
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
            <div className="w-1/3 text-right relative z-10">{bid.amount}</div>
            <div className="w-1/3 text-right relative z-10">{bid.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
