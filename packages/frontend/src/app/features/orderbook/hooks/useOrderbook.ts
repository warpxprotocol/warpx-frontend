'use client';

import { PalletHybridOrderbookPool } from '@warpx/sdk/src/interfaces/augment-types';
import { useState } from 'react';

export const useOrderbook = () => {
  const [orderbook, setOrderbook] = useState<PalletHybridOrderbookPool | null>(null);
};
