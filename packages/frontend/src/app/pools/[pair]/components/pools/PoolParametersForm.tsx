'use client';

import { Info } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

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
  tickSize,
  setTickSize,
  lotSize,
  setLotSize,
  poolDecimals,
  setPoolDecimals,
  baseAssetDecimals,
  quoteAssetDecimals,
}: PoolParametersFormProps) {
  // Only allow numeric input
  const handleNumberInput = (value: string, setter: Dispatch<SetStateAction<string>>) => {
    // Allow empty string or numbers with optional decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  // Calculate the actual applied value for decimals
  const calculateDecimalValue = (value: string, decimals?: number): string => {
    if (!value || !decimals) return '0';

    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0';

      // Calculate the actual value: input * 10^(-decimals)
      const actualValue = numValue * Math.pow(10, -decimals);

      // Format with appropriate decimal places
      return actualValue.toFixed(decimals);
    } catch (e) {
      return '0';
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-white">풀 파라미터 설정</h3>

      {/* Taker Fee Rate */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="takerFeeRate" className="text-gray-400 text-sm">
            Taker Fee Rate (%)
          </Label>
          <div className="ml-1" title="거래 수수료 비율 (%)">
            <Info className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <Input
            type="text"
            min={0}
            max={100}
            value={takerFeeRate}
            onChange={(e) => handleNumberInput(e.target.value, setTakerFeeRate)}
            className="w-full text-white"
            inputMode="decimal"
          />
          <p className="mt-1 text-xs text-gray-500">Taker Fee Rate: {takerFeeRate}%</p>
        </div>
      </div>

      {/* Tick Size */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="tickSize" className="text-gray-400 text-sm">
            Tick Size
          </Label>
          <div className="ml-1" title="최소 가격 변동 단위">
            <Info className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <Input
            id="tickSize"
            type="text"
            min={1}
            value={tickSize}
            onChange={(e) => handleNumberInput(e.target.value, setTickSize)}
            className="w-full text-white"
            inputMode="decimal"
          />
          <p className="mt-1 text-xs text-gray-500">
            Tick Size: {calculateDecimalValue(tickSize, parseInt(poolDecimals))} (Pool
            Decimals: {poolDecimals})
          </p>
        </div>
      </div>

      {/* Lot Size */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="lotSize" className="text-gray-400 text-sm">
            Lot Size
          </Label>
          <div className="ml-1" title="최소 거래 단위">
            <Info className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <Input
            id="lotSize"
            type="text"
            min={1}
            value={lotSize}
            onChange={(e) => handleNumberInput(e.target.value, setLotSize)}
            className="w-full text-white"
            inputMode="decimal"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lot Size:{' '}
            {baseAssetDecimals !== undefined
              ? calculateDecimalValue(lotSize, baseAssetDecimals)
              : lotSize}{' '}
            (Base Asset Decimals: {baseAssetDecimals})
          </p>
        </div>
      </div>

      {/* Pool Decimals */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="poolDecimals" className="text-gray-400 text-sm">
            Pool Decimals
          </Label>
          <div className="ml-1" title="풀 토큰의 소수점 자릿수">
            <Info className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <Input
            id="poolDecimals"
            type="text"
            min={0}
            max={18}
            value={poolDecimals}
            onChange={(e) => handleNumberInput(e.target.value, setPoolDecimals)}
            className="w-full text-white"
            inputMode="decimal"
          />
          {baseAssetDecimals !== undefined && quoteAssetDecimals !== undefined && (
            <p className="mt-1 text-xs text-gray-500">
              Base Asset ({baseAssetDecimals} decimals) and Quote Asset (
              {quoteAssetDecimals} decimals)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
