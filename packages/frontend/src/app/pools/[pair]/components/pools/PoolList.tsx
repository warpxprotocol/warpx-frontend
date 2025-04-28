import { Pool } from '@/app/pools/[pair]/components/pools/types';

import { PoolRow } from './PoolRow';

export function PoolList({ pools }: { pools: Pool[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#18181B] mt-8">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[#23232A] text-gray-400">
            <th className="py-3 px-4 text-left font-semibold">POOL</th>
            <th className="py-3 px-4 text-left font-semibold">PROTOCOL</th>
            <th className="py-3 px-4 text-left font-semibold">FEE TIER</th>
            <th className="py-3 px-4 text-left font-semibold">TVL</th>
            <th className="py-3 px-4 text-left font-semibold">APR</th>
            <th className="py-3 px-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <PoolRow key={pool.id} pool={pool} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
