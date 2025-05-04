'use client';

import { Info } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PoolParametersFormProps {
  takerFeeRate: string;
  setTakerFeeRate: Dispatch<SetStateAction<string>>;
  tickSize: string;
  setTickSize: Dispatch<SetStateAction<string>>;
  lotSize: string;
  setLotSize: Dispatch<SetStateAction<string>>;
  poolDecimals: string;
  setPoolDecimals: Dispatch<SetStateAction<string>>;
  baseAssetDecimals?: number;
  quoteAssetDecimals?: number;
}

export function PoolParametersForm({
  takerFeeRate,
  setTakerFeeRate,
  poolDecimals,
  setPoolDecimals,
  baseAssetDecimals,
  quoteAssetDecimals,
}: PoolParametersFormProps) {
  // Tick Size: 1 * 10^(-poolDecimals)
  const tickSizeRaw =
    poolDecimals && !isNaN(Number(poolDecimals))
      ? 1 * Math.pow(10, -parseInt(poolDecimals))
      : 0;

  // Lot Size: 1 * 10^(baseAssetDecimals - poolDecimals)
  const lotSizeRaw =
    baseAssetDecimals !== undefined && poolDecimals && !isNaN(Number(poolDecimals))
      ? 1 * Math.pow(10, baseAssetDecimals - parseInt(poolDecimals))
      : 0;

  // Human readable format
  const tickSizeHuman =
    poolDecimals && !isNaN(Number(poolDecimals))
      ? tickSizeRaw.toLocaleString(undefined, {
          minimumFractionDigits: parseInt(poolDecimals),
          useGrouping: false,
        })
      : '0';

  const lotSizeHuman =
    baseAssetDecimals !== undefined && poolDecimals && !isNaN(Number(poolDecimals))
      ? lotSizeRaw.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          useGrouping: false,
        })
      : '0';

  useEffect(() => {
    console.log('--- Pool Parameter Calculation ---');
    console.log(`Taker Fee Rate: ${takerFeeRate}`);
    console.log(`Pool Decimals: ${poolDecimals}`);
    console.log(`Base Asset Decimals: ${baseAssetDecimals}`);
    console.log(`Quote Asset Decimals: ${quoteAssetDecimals}`);
    console.log(
      `Tick Size = 1 * 10^(-${poolDecimals}) = ${tickSizeRaw} (human: ${tickSizeHuman})`,
    );
    if (baseAssetDecimals !== undefined) {
      console.log(
        `Lot Size = 1 * 10^(${baseAssetDecimals} - ${poolDecimals}) = ${lotSizeRaw} (human: ${lotSizeHuman})`,
      );
    }
    console.log('----------------------------------');
  }, [
    takerFeeRate,
    poolDecimals,
    baseAssetDecimals,
    quoteAssetDecimals,
    tickSizeRaw,
    lotSizeRaw,
    tickSizeHuman,
    lotSizeHuman,
  ]);

  return (
    <div className="space-y-4 mt-6">
      {/* Taker Fee Rate */}
      <div className="space-y-2">
        <Label htmlFor="takerFeeRate" className="text-gray-400 text-sm">
          Taker Fee Rate (%)
        </Label>
        <Input
          type="text"
          min={0}
          max={100}
          value={takerFeeRate}
          onChange={(e) => setTakerFeeRate(e.target.value)}
          className="w-full text-white"
          inputMode="decimal"
        />
      </div>

      {/* Pool Decimals */}
      <div className="space-y-2">
        <Label htmlFor="poolDecimals" className="text-gray-400 text-sm">
          Pool Decimals
        </Label>
        <Input
          id="poolDecimals"
          type="text"
          min={0}
          max={18}
          value={poolDecimals}
          onChange={(e) => setPoolDecimals(e.target.value)}
          className="w-full text-white"
          inputMode="decimal"
        />
      </div>
    </div>
  );
}
