import React, { useState } from 'react';

import { OrderType, TradeSide } from '@/app/features/trade/useTradeOperations';
import TradeInputLimit from '@/app/pools/[pair]/components/trade/TradeInputLimit';
import TradeInputMarket from '@/app/pools/[pair]/components/trade/TradeInputMarket';
import { PoolInfoDisplay } from '@/app/pools/[pair]/context/PoolDataContext';

export interface TradeInputProps {
  orderType: OrderType;
  side: TradeSide;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  setAmount: (amount: string) => void;
  price: string;
  setPrice: (price: string) => void;
  availableBalance: string;
  poolInfo?: PoolInfoDisplay;
  poolMetadata?: any;
  decimals?: number;
}

function formatBalance(raw: string, decimals: number = 6) {
  if (!raw) return '0';
  return (Number(raw) / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
}

function formatDisplayAmount(amount: string, decimals: number = 6) {
  if (!amount) return '';
  return Number(amount).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
}

export default function TradeInput(
  props: TradeInputProps & { baseAssetBalance: string; quoteAssetBalance: string },
) {
  if (props.orderType === 'market') {
    return <TradeInputMarket {...props} />;
  }
  return <TradeInputLimit {...props} />;
}
