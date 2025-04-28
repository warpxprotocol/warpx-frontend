import React from 'react';

interface LpPositionInfoProps {
  lpTokenBalance: {
    lpTokenId?: number;
    rawBalance?: string;
    humanReadableBalance?: number;
    lpTokenSymbol?: string;
    lpTokenDecimals?: number;
    baseAssetId?: number;
    quoteAssetId?: number;
  };
  token0Symbol: string;
  token1Symbol: string;
  lpTokenPercentage: number;
  poolInfo: any;
  formattedLpBalance: string;
}

export const LpPositionInfo: React.FC<LpPositionInfoProps> = ({
  lpTokenBalance,
  token0Symbol,
  token1Symbol,
  lpTokenPercentage,
  poolInfo,
  formattedLpBalance,
}) => {
  if (!lpTokenBalance) return null;

  return (
    <div className="mt-6 mb-6 bg-[#1F1F25] rounded-xl p-5">
      <h3 className="text-white font-medium text-lg mb-4">Your LP Position</h3>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="relative mr-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {token0Symbol.charAt(0)}
            </div>
            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold absolute -right-2 -bottom-1 border-2 border-[#1F1F25]">
              {token1Symbol.charAt(0)}
            </div>
          </div>
          <span className="text-white ml-3">{token0Symbol}/{token1Symbol}</span>
        </div>
        <span className="text-white font-medium">{formattedLpBalance} {lpTokenBalance?.lpTokenSymbol || ''}</span>
      </div>

      {poolInfo && poolInfo.poolExists && typeof poolInfo.feeTier === 'number' && (
        <div className="text-sm text-gray-400 mb-1">
          Pool fee tier: {(poolInfo.feeTier / 100).toFixed(2)}%
        </div>
      )}
      
      {lpTokenPercentage > 0 && (
        <div className="text-sm text-gray-400">
          Pool share: {lpTokenPercentage.toFixed(2)}%
        </div>
      )}
    </div>
  );
};
