'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AddRemoveLiquidityModal } from '@/app/pools/[pair]/components/pools/AddRemoveLiquidityModal';
import { Pool } from '@/app/pools/[pair]/components/pools/types';
import { Button } from '@/components/ui/button';

function formatNumberShort(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function PoolRow({ pool, reserve }: { pool: Pool; reserve?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tvl, setTvl] = useState<string | number | null>(null);
  const apr = pool.apr ?? 'N/A';

  useEffect(() => {
    if (!reserve || !reserve.data) {
      setTvl(null);
      return;
    }

    const dot = pool.token0.symbol === 'DOT' ? pool.token0 : pool.token1;
    const usdt = pool.token0.symbol === 'USDT' ? pool.token0 : pool.token1;

    const dotReserveRaw = reserve.data.baseReserve || '0';
    const usdtReserveRaw = reserve.data.quoteReserve || '0';
    const dotDecimals = getDecimals(dot.symbol);
    const usdtDecimals = getDecimals(usdt.symbol);

    const parseReserve = (value: string | undefined) =>
      value ? value.replace(/,/g, '') : '0';

    const dotAmountRaw = parseReserve(dotReserveRaw);
    const usdtAmountRaw = parseReserve(usdtReserveRaw);

    const getTokenPrice = async (symbol: string) => {
      if (symbol === 'WARP') {
        const id = 'warp-protocol';
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=eth`,
        );
        const data = await res.json();
        return data[id]?.eth ?? 0;
      }
      const idMap: Record<string, string> = {
        DOT: 'polkadot',
        USDT: 'tether',
      };
      const id = idMap[symbol.toUpperCase()];
      if (!id) return 0;
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      );
      const data = await res.json();
      return data[id]?.usd ?? 0;
    };

    (async () => {
      try {
        const dotPrice = await getTokenPrice('DOT');
        const usdtPrice = await getTokenPrice('USDT');

        const dotAmount = Number(dotAmountRaw) / 10 ** dotDecimals;
        const usdtAmount = Number(usdtAmountRaw) / 10 ** usdtDecimals;

        const dotValue = dotAmount * dotPrice;
        const usdtValue = usdtAmount * usdtPrice;

        const tvlValue = dotValue + usdtValue;

        if (pool.token0.symbol === 'WARP' || pool.token1.symbol === 'WARP') {
          // warp 페어: WARP(ETH) 단위로 TVL 표시
          setTvl(isNaN(tvlValue) ? 0 : `${tvlValue.toFixed(2)} WARP`);
        } else {
          // 나머지 페어: USD 단위로 TVL 표시
          setTvl(isNaN(tvlValue) ? 0 : formatNumberShort(tvlValue));
        }
      } catch {
        setTvl(0);
      }
    })();
  }, [pool, reserve]);

  if (!reserve) {
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
        <td className="py-3 px-4 text-gray-300">
          <Link
            href={`/pools/${encodeURIComponent(pool.id)}?baseId=${pool.token0.id}&quoteId=${pool.token1.id}`}
            className="block"
          >
            {pool.feeTier}
          </Link>
        </td>
        <td className="py-3 px-4 text-gray-300">
          <span className="inline-block h-5 w-16 bg-gray-700 rounded animate-pulse" />
        </td>
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
      <td className="py-3 px-4 text-gray-300">
        <Link
          href={`/pools/${encodeURIComponent(pool.id)}?baseId=${pool.token0.id}&quoteId=${pool.token1.id}`}
          className="block"
        >
          {pool.feeTier}
        </Link>
      </td>
      <td className="py-3 px-4 text-gray-300">
        {tvl === null ? (
          <span className="inline-block h-5 w-16 bg-gray-700 rounded animate-pulse" />
        ) : (
          <span>$ {tvl}</span>
        )}
      </td>
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

type TVLProps = { tvl: number };

export function TVLDisplay({ tvl }: TVLProps) {
  // 단위 축약
  const formatNumberShort = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return <span>${formatNumberShort(tvl)}</span>;
}

function getDecimals(symbol: string): number {
  const s = symbol.toUpperCase();
  if (s === 'DOT') return 10;
  if (s === 'USDT') return 6;
  if (s === 'WARP') return 6;
  return 6; // default
}
