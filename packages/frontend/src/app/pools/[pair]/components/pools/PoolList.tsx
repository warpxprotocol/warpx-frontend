import { useEffect, useState } from 'react';

import { Pool } from '@/app/pools/[pair]/components/pools/types';

import { PoolRow } from './PoolRow';
import { usePoolOperations } from './usePoolOperations';

// pool list data 불러오는거 개선

export function PoolList({ pools }: { pools: Pool[] }) {
  const { getPoolQueryRpc } = usePoolOperations();
  const [reserves, setReserves] = useState<{ [poolId: string]: any }>({});

  useEffect(() => {
    // 모든 풀의 reserve를 비동기로 가져오기
    async function fetchReserves() {
      const results: { [poolId: string]: any } = {};
      await Promise.all(
        pools.map(async (pool) => {
          try {
            const reserve = await getPoolQueryRpc(pool.token0.id, pool.token1.id); // pool.id 또는 필요한 파라미터
            results[pool.id] = reserve;
          } catch (e) {
            results[pool.id] = null;
          }
        }),
      );
      setReserves(results);
    }
    fetchReserves();
  }, [pools, getPoolQueryRpc]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#18181B] mt-8">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[#23232A] text-gray-400">
            <th className="py-3 px-4 text-left font-semibold">POOL</th>
            <th className="py-3 px-4 text-left font-semibold">FEE TIER</th>
            <th className="py-3 px-4 text-left font-semibold">TVL</th>
            {/* <th className="py-3 px-4 text-left font-semibold">APR</th> */}
            <th className="py-3 px-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <PoolRow
              key={pool.id}
              pool={pool}
              reserve={reserves[pool.id]} // reserve 정보 전달
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
