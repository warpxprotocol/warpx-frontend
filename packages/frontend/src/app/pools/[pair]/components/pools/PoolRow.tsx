'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AddRemoveLiquidityModal } from '@/app/pools/[pair]/components/pools/AddRemoveLiquidityModal';
import { Pool } from '@/app/pools/[pair]/components/pools/types';
import { Button } from '@/components/ui/button';

export function PoolRow({ pool }: { pool: Pool }) {
  const [isOpen, setIsOpen] = useState(false);

  // 가격 정보가 없으므로 TVL, APR은 N/A로 표시
  const tvl = pool.tvl ?? 'N/A';
  const apr = pool.apr ?? 'N/A';

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="py-3 px-4 font-medium text-white">
        <Link
          href={`/pools/${encodeURIComponent(pool.id)}?baseId=${pool.token0.id}&quoteId=${pool.token1.id}`}
          className="block"
        >
          {pool.name}
        </Link>
      </td>
      {/* <td className="py-3 px-4 text-gray-300">
        <Link
          href={`/pools/${encodeURIComponent(pool.id)}?baseId=${pool.token0.id}&quoteId=${pool.token1.id}`}
          className="block"
        >
          {pool.protocol}
        </Link>
      </td> */}
      <td className="py-3 px-4 text-gray-300">
        <Link
          href={`/pools/${encodeURIComponent(pool.id)}?baseId=${pool.token0.id}&quoteId=${pool.token1.id}`}
          className="block"
        >
          {pool.feeTier}
        </Link>
      </td>
      <td className="py-3 px-4 text-gray-300">{tvl}</td>
      <td className="py-3 px-4 text-gray-300">{apr}</td>
      {/* Add pool actions */}
      <td className="py-3 px-4 text-gray-300">
        <Button variant="ghost" className="text-gray-300" onClick={() => setIsOpen(true)}>
          Add
        </Button>
        <AddRemoveLiquidityModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          type="add"
          poolName={pool.name}
          onSubmit={() => {}}
          token0={pool.token0}
          token1={pool.token1}
        />
      </td>
    </tr>
  );
}
