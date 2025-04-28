import React, { useEffect, useState } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';

import { LpPositionInfo } from './LpPositionInfo';
import { TokenInfo } from './types';
import { usePoolOperations } from './usePoolOperations';

interface AddRemoveLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'add' | 'remove';
  poolName: string;
  onSubmit?: (amounts: { token0: number; token1: number }) => void;
  token0: TokenInfo;
  token1: TokenInfo;
}

export const AddRemoveLiquidityModal: React.FC<AddRemoveLiquidityModalProps> = ({
  isOpen,
  onClose,
  type,
  poolName,
  token0,
  token1,
}) => {
  const { api } = useApi();
  // If token info is missing, do not render the modal
  if (!token0 || !token1) {
    console.warn('Token information missing');
    return null;
  }
  const {
    addLiquidity,
    getPoolPriceRatio,
    getLpTokenBalance,
    getPoolInfo,
    removeLiquidity,
  } = usePoolOperations();
  const { selectedAccount } = useWalletStore();
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [priceRatio, setPriceRatio] = useState<number | null>(null);
  // New: display balances (with decimals)
  const [displayBalance0, setDisplayBalance0] = useState<string>('0');
  const [displayBalance1, setDisplayBalance1] = useState<string>('0');
  // LP 토큰 관련 상태
  const [lpTokenBalance, setLpTokenBalance] = useState<{
    lpTokenId: number;
    rawBalance: string;
    humanReadableBalance: number;
    lpTokenSymbol: string;
    lpTokenDecimals: number;
    baseAssetId: number;
    quoteAssetId: number;
  } | null>(null);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [lpTokenPercentage, setLpTokenPercentage] = useState<number>(0);

  useEffect(() => {
    async function fetchBalances() {
      if (!api || !selectedAccount) return;

      // 토큰 메타데이터 조회
      const meta0 = await api.query.assets.metadata(token0.id);
      const meta1 = await api.query.assets.metadata(token1.id);
      const humanMeta0 = meta0.toHuman();
      const humanMeta1 = meta1.toHuman();
      const decimals0 =
        typeof humanMeta0 === 'object' && humanMeta0 !== null && 'decimals' in humanMeta0
          ? Number(humanMeta0.decimals)
          : 0;
      const decimals1 =
        typeof humanMeta1 === 'object' && humanMeta1 !== null && 'decimals' in humanMeta1
          ? Number(humanMeta1.decimals)
          : 0;

      // 잔액 조회
      const balance0 = await api.query.assets.account(token0.id, selectedAccount);
      const balance1 = await api.query.assets.account(token1.id, selectedAccount);
      function extractBalance(json: any): bigint {
        if (
          json &&
          typeof json === 'object' &&
          'balance' in json &&
          typeof json.balance === 'string'
        ) {
          return BigInt(json.balance);
        }
        return 0n;
      }
      const bal0 = extractBalance(balance0.toJSON());
      const bal1 = extractBalance(balance1.toJSON());
      const lpBalance = await getLpTokenBalance(
        Number(token0.id),
        Number(token1.id),
        selectedAccount,
      );
      console.log('[DEBUG] getLpTokenBalance result:', lpBalance);
      // 화면에 표시할 잔액 포맷팅
      setDisplayBalance0(
        (Number(bal0) / Math.pow(10, decimals0)).toLocaleString(undefined, {
          maximumFractionDigits: decimals0,
        }),
      );
      setDisplayBalance1(
        (Number(bal1) / Math.pow(10, decimals1)).toLocaleString(undefined, {
          maximumFractionDigits: decimals1,
        }),
      );

      // LP 토큰 잔액 조회 추가
      try {
        // 1. 풀 정보 가져오기
        const poolInfoData = await getPoolInfo(Number(token0.id), Number(token1.id));
        setPoolInfo(poolInfoData);

        if (poolInfoData.poolExists) {
          // 2. LP 토큰 잔액 가져오기
          const lpBalance = await getLpTokenBalance(
            Number(token0.id),
            Number(token1.id),
            selectedAccount,
          );
          setLpTokenBalance(lpBalance);

          // 3. 전체 LP 유동성에서의 비율 계산 (선택적)
          if (lpBalance.lpTokenId) {
            try {
              // LP 토큰의 총 공급량 조회
              const totalSupplyInfo = await api.query.assets.asset(lpBalance.lpTokenId);
              const totalSupplyData = totalSupplyInfo.toJSON();
              if (
                totalSupplyData &&
                typeof totalSupplyData === 'object' &&
                'supply' in totalSupplyData &&
                totalSupplyData.supply !== null &&
                totalSupplyData.supply !== undefined
              ) {
                const totalSupply = BigInt(totalSupplyData.supply.toString());
                if (totalSupply > 0n) {
                  const userRawBalance = BigInt(lpBalance.rawBalance || '0');
                  const percentage = (Number(userRawBalance) / Number(totalSupply)) * 100;
                  setLpTokenPercentage(percentage);
                }
              }
            } catch (err) {
              console.error('Error calculating LP token percentage:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching LP token balance:', error);
      }
    }
    if (isOpen) {
      fetchBalances();
    }
  }, [api, selectedAccount, token0.id, token1.id]);

  useEffect(() => {
    // Fetch price ratio when modal opens
    if (isOpen && token0 && token1) {
      const fetchPriceRatio = async () => {
        try {
          // 기존 가격 비율 로직
          const ratio = await getPoolPriceRatio(token0.id, token1.id);

          // poolInfo가 있는 경우, reserve 값을 사용하여 가격 배율 수동 계산 (추가 안정성)
          if (poolInfo && poolInfo.poolExists && poolInfo.reserve0 && poolInfo.reserve1) {
            const meta0 = await api?.query.assets.metadata(token0.id);
            const meta1 = await api?.query.assets.metadata(token1.id);
            const humanMeta0 = meta0?.toHuman();
            const humanMeta1 = meta1?.toHuman();

            const decimals0 =
              typeof humanMeta0 === 'object' &&
              humanMeta0 !== null &&
              'decimals' in humanMeta0
                ? Number(humanMeta0.decimals)
                : 0;
            const decimals1 =
              typeof humanMeta1 === 'object' &&
              humanMeta1 !== null &&
              'decimals' in humanMeta1
                ? Number(humanMeta1.decimals)
                : 0;

            // 소수점 고려하여 수동으로 가격 계산
            const reserve0Adjusted = Number(poolInfo.reserve0) / Math.pow(10, decimals0);
            const reserve1Adjusted = Number(poolInfo.reserve1) / Math.pow(10, decimals1);

            if (reserve0Adjusted > 0 && reserve1Adjusted > 0) {
              const calculatedRatio = reserve1Adjusted / reserve0Adjusted;
              setPriceRatio(calculatedRatio);
              return;
            }
          }

          // 위의 계산이 실패하면 기본 로직 사용
          if (ratio) {
            setPriceRatio(ratio);
          }
        } catch (error) {
          console.error('Failed to fetch price ratio:', error);
        }
      };

      fetchPriceRatio();
    }
  }, [isOpen, token0, token1, getPoolPriceRatio, api, poolInfo]);

  const handleAmount0Change = (value: string) => {
    setAmount0(value);
    if (priceRatio && value) {
      try {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
          const calculated = parsedValue * priceRatio;
          setAmount1(calculated.toFixed(6));
        }
      } catch (error) {
        console.error('Error calculating token amount:', error);
      }
    }
  };

  const handleAmount1Change = (value: string) => {
    setAmount1(value);
    if (priceRatio && value) {
      try {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue) && priceRatio !== 0) {
          const calculated = parsedValue / priceRatio;
          setAmount0(calculated.toFixed(6));
        }
      } catch (error) {
        console.error('Error calculating token amount:', error);
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 제거 모드인 경우 제거 로직 처리
      if (type === 'remove' && lpTokenBalance && selectedAccount) {
        if (!lpTokenBalance.lpTokenId) {
          throw new Error('LP token ID not found');
        }

        if (!amount0 || !amount1 || Number(amount0) <= 0 || Number(amount1) <= 0) {
          alert('제거할 수량을 입력하세요.');
          setIsLoading(false);
          return;
        }

        // 그루핑을 위해 풀 정보 가져오기
        const poolInfo = await getPoolInfo(Number(token0.id), Number(token1.id));
        if (!poolInfo.poolExists) {
          throw new Error('Pool does not exist');
        }

        // LP 토큰 수량 계산
        // LP 토큰 제거량 계산                // 토큰 양에 따른 제거 비율 계산 (소수점 및 NaN 방지)
        let lpRemoveRatio = 0;
        try {
          if (poolInfo.reserve0 > 0 && poolInfo.reserve1 > 0) {
            lpRemoveRatio = Math.min(
              Number(amount0) / (poolInfo.reserve0 / Math.pow(10, 18)),
              Number(amount1) / (poolInfo.reserve1 / Math.pow(10, 18)),
            );
          }
        } catch (e) {
          console.error('Error calculating removal ratio:', e);
          lpRemoveRatio = 0;
        }

        // lpRemoveRatio를 0 ~ 1 사이로 조정
        const normalizedRatio = Math.min(Math.max(lpRemoveRatio, 0), 1);
        const lpAmountToRemove =
          (BigInt(lpTokenBalance.rawBalance) * BigInt(Math.floor(normalizedRatio * 100))) /
          100n;

        // 최소 반환량은 90% 확보
        const minBaseAmount = ((BigInt(amount0) * 90n) / 100n).toString();
        const minQuoteAmount = ((BigInt(amount1) * 90n) / 100n).toString();

        // LP 토큰 제거 호출
        await removeLiquidity(
          { WithId: token0.id },
          { WithId: token1.id },
          lpAmountToRemove.toString(),
          minBaseAmount,
          minQuoteAmount,
          selectedAccount,
          selectedAccount,
        );

        onClose();
        return;
      }

      // 아래는 기존 추가 로직
      // Utility to convert human amount to raw integer string
      function toRawAmount(amount: string, decimals: number): string {
        // Avoid floating point errors for large decimals
        return BigInt(Math.floor(Number(amount) * 10 ** decimals)).toString();
      }
      // Fetch decimals for each token
      if (!api) throw new Error('API not connected');
      const meta0 = await api.query.assets.metadata(token0.id);
      const meta1 = await api.query.assets.metadata(token1.id);
      const humanMeta0 = meta0.toHuman();
      const humanMeta1 = meta1.toHuman();
      const decimals0 =
        typeof humanMeta0 === 'object' && humanMeta0 !== null && 'decimals' in humanMeta0
          ? Number(humanMeta0.decimals)
          : 0;
      const decimals1 =
        typeof humanMeta1 === 'object' && humanMeta1 !== null && 'decimals' in humanMeta1
          ? Number(humanMeta1.decimals)
          : 0;
      const rawAmount0 = toRawAmount(amount0, decimals0);
      const rawAmount1 = toRawAmount(amount1, decimals1);
      if (rawAmount0 === '0' || rawAmount1 === '0') {
        throw new Error('Amount too small. Please enter a larger value.');
      }
      if (!selectedAccount) throw new Error('No wallet/account connected');
      // 1. 잔고 조회
      const balance0 = await api.query.assets.account(token0.id, selectedAccount);
      const balance1 = await api.query.assets.account(token1.id, selectedAccount);
      function extractBalance(json: any): bigint {
        if (
          json &&
          typeof json === 'object' &&
          'balance' in json &&
          typeof json.balance === 'string'
        ) {
          return BigInt(json.balance);
        }
        return 0n;
      }
      const bal0 = extractBalance(balance0.toJSON());
      const bal1 = extractBalance(balance1.toJSON());
      // 2. min 값 99%로 설정
      const minBase = ((BigInt(rawAmount0) * 99n) / 100n).toString();
      const minQuote = ((BigInt(rawAmount1) * 99n) / 100n).toString();

      // Prevent 0 or empty supply
      if (!amount0 || !amount1 || Number(amount0) <= 0 || Number(amount1) <= 0) {
        alert('공급량을 올바르게 입력하세요.');
        setIsLoading(false);
        return;
      }
      if (bal0 < BigInt(rawAmount0) || bal1 < BigInt(rawAmount1)) {
        throw new Error('Insufficient balance for one or both tokens.');
      }
      // Check if pool exists before submitting
      let poolExists = false;
      let poolOrder: 'token0-token1' | 'token1-token0' | null = null;
      try {
        const poolsData = await api.query.hybridOrderbook.pools.entries();
        for (const entry of poolsData as any[]) {
          const key = entry[0];
          const value = entry[1];
          const keyHuman = typeof key.toHuman === 'function' ? key.toHuman() : undefined;
          const valueHuman =
            typeof value.toHuman === 'function' ? value.toHuman() : undefined;
          if (
            !Array.isArray(keyHuman) ||
            !valueHuman ||
            Object.keys(valueHuman).length === 0
          )
            continue;
          const extractId = (x: any) =>
            typeof x === 'object' && x !== null && 'WithId' in x
              ? Number(x.WithId)
              : typeof x === 'number'
                ? x
                : Number(x);
          const keyArr = Array.isArray(keyHuman[0]) ? keyHuman[0] : keyHuman;
          const baseAssetId = extractId(keyArr[0]);
          const quoteAssetId = extractId(keyArr[1]);
          // 두 방향 모두 체크: (token0, token1) 또는 (token1, token0)
          if (baseAssetId === Number(token0.id) && quoteAssetId === Number(token1.id)) {
            if (valueHuman) {
              poolExists = true;
              poolOrder = 'token0-token1';

              break;
            }
          } else if (
            baseAssetId === Number(token1.id) &&
            quoteAssetId === Number(token0.id)
          ) {
            if (valueHuman) {
              poolExists = true;
              poolOrder = 'token1-token0';

              break;
            }
          }
        }
      } catch (err) {
        console.error('Failed to check pool existence:', err);
      }
      if (!poolExists) {
        setIsLoading(false);
        alert('해당 토큰 쌍의 풀이 존재하지 않습니다. 먼저 풀을 생성하세요.');
        return;
      }
      // 어떤 순서로 풀 공급을 시도할지 poolOrder 값에 따라 결정
      if (poolOrder === 'token0-token1') {
        await addLiquidity(
          { WithId: token0.id },
          { WithId: token1.id },
          rawAmount0,
          rawAmount1,
          minBase,
          minQuote,
          selectedAccount,
          selectedAccount, // pass full account object for correct signer
        );
      } else if (poolOrder === 'token1-token0') {
        await addLiquidity(
          { WithId: token1.id },
          { WithId: token0.id },
          rawAmount1,
          rawAmount0,
          minQuote,
          minBase,
          selectedAccount,
          selectedAccount, // pass full account object for correct signer
        );
      }
      onClose();
    } catch (error) {
      console.error('Error adding liquidity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const usd0 = amount0
    ? (parseFloat(amount0) * token0.usdPrice).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      })
    : 'US$0';
  const usd1 = amount1
    ? (parseFloat(amount1) * token1.usdPrice).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      })
    : 'US$0';

  // LP 토큰 잔액 표시를 위한 포맷팅
  const formattedLpBalance = lpTokenBalance
    ? lpTokenBalance.humanReadableBalance.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-md border border-gray-700 shadow-lg relative">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 헤더 */}
        <h2 className="text-2xl font-semibold mb-2 text-white">
          {type === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
        </h2>
        <div className="mb-6 text-gray-400 text-sm">
          Specify the token amounts required for liquidity.
        </div>

        {/* 토큰 입력 영역 */}
        <div className="space-y-4">
          {/* 첫 번째 토큰 입력 */}
          <div className="bg-[#232326] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="number"
                min="0"
                step="any"
                className="w-3/5 bg-transparent border-none text-3xl text-white font-semibold focus:outline-none placeholder-gray-600"
                placeholder="0"
                value={amount0}
                onChange={(e) => handleAmount0Change(e.target.value)}
              />
              <div className="flex items-center bg-[#2B2B33] rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                  {token0.symbol.charAt(0)}
                </div>
                <span className="text-base font-medium text-white">{token0.symbol}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-xs">{usd0}</div>
              <div className="text-xs text-gray-400">
                Balance: {displayBalance0} {token0.symbol}
              </div>
            </div>
          </div>

          {/* 두 번째 토큰 입력 */}
          <div className="bg-[#232326] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="number"
                min="0"
                step="any"
                className="w-3/5 bg-transparent border-none text-3xl text-white font-semibold focus:outline-none placeholder-gray-600"
                placeholder="0"
                value={amount1}
                onChange={(e) => handleAmount1Change(e.target.value)}
              />
              <div className="flex items-center bg-[#2B2B33] rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                  {token1.symbol.charAt(0)}
                </div>
                <span className="text-base font-medium text-white">{token1.symbol}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-xs">{usd1}</div>
              <div className="flex space-x-2 items-center">
                <div className="text-xs text-gray-400">
                  Balance: {displayBalance1} {token1.symbol}
                </div>
                <button
                  onClick={() => handleAmount1Change(displayBalance1.replace(/,/g, ''))}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pool/LP 존재 여부 안내 */}
        {poolInfo && !poolInfo.poolExists && (
          <div className="text-red-500 text-center my-4">
            No liquidity pool exists for this token pair.<br/>Please create the pool first.
          </div>
        )}

        {/* LP 포지션 정보 - 풀/LP가 있을 때만 */}
        {lpTokenBalance && lpTokenBalance.lpTokenId !== 0 && poolInfo && poolInfo.poolExists && (
          <LpPositionInfo
            lpTokenBalance={lpTokenBalance}
            token0Symbol={token0.symbol}
            token1Symbol={token1.symbol}
            lpTokenPercentage={lpTokenPercentage}
            poolInfo={poolInfo}
            formattedLpBalance={formattedLpBalance || (lpTokenBalance.humanReadableBalance?.toLocaleString(undefined, { maximumFractionDigits: lpTokenBalance.lpTokenDecimals || 6 }) || '0')}
          />
        )}

        {/* 버튼 */}
        <Button
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl text-lg transition-all duration-200 border-none"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !amount0 ||
            !amount1 ||
            Number(amount0) <= 0 ||
            Number(amount1) <= 0 ||
            (poolInfo && !poolInfo.poolExists)
          }
        >
          {isLoading
            ? 'Processing...'
            : type === 'add'
              ? 'Add Liquidity'
              : 'Remove Liquidity'}
        </Button>
      </div>
    </div>
  );
};
