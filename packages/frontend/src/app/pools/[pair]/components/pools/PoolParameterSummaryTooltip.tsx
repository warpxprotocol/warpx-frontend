import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PoolParameterSummaryTooltipProps {
  baseAsset: { symbol: string; id: number; decimals: number };
  quoteAsset: { symbol: string; id: number; decimals: number };
  takerFeeRate: string;
  tickSize: string;
  lotSize: string;
  poolDecimals: string;
}

export function PoolParameterSummaryTooltip({
  baseAsset,
  quoteAsset,
  takerFeeRate,
  tickSize,
  lotSize,
  poolDecimals,
}: PoolParameterSummaryTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-pointer text-blue-400 hover:underline text-xs">
            <Info className="w-2 h-2" />
            Pool Parameter Calculation
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-md p-4 bg-gray-900 text-gray-200 text-xs rounded-lg shadow-lg"
        >
          <div className="font-semibold mb-2">Pool Summary</div>
          <div>
            Base Token: {baseAsset.symbol} (ID: {baseAsset.id}, Decimals:{' '}
            {baseAsset.decimals})
          </div>
          <div>
            Quote Token: {quoteAsset.symbol} (ID: {quoteAsset.id}, Decimals:{' '}
            {quoteAsset.decimals})
          </div>
          <div>
            Taker Fee Rate: {takerFeeRate} %<br />
            <span className="text-gray-400">
              (Permill: {Math.floor(Number(takerFeeRate) * 10000)} = {takerFeeRate} ×
              10,000)
            </span>
          </div>
          <div>Pool Decimals: {poolDecimals}</div>
          <div>Base Asset Decimals: {baseAsset.decimals}</div>
          <div>Quote Asset Decimals: {quoteAsset.decimals}</div>
          <div>
            Tick Size = {tickSize} * 10^(-{poolDecimals}) ={' '}
            {Number(tickSize) * Math.pow(10, -Number(poolDecimals))} (human:{' '}
            {Number(tickSize) * Math.pow(10, -Number(poolDecimals))})
          </div>
          <div>
            Lot Size = {lotSize} * 10^({baseAsset.decimals} - {poolDecimals}) ={' '}
            {Number(lotSize) *
              Math.pow(10, Number(baseAsset.decimals) - Number(poolDecimals))}{' '}
            (human:{' '}
            {Number(lotSize) *
              Math.pow(10, Number(baseAsset.decimals) - Number(poolDecimals))}
            )
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
