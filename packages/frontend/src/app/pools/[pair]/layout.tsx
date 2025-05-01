'use client';

import { usePoolDataFetcher } from './context/PoolDataContext';

export default function PairLayout({ children }: { children: React.ReactNode }) {
  usePoolDataFetcher();

  return <>{children}</>;
}
