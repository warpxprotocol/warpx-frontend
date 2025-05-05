'use client';

import React, { useEffect, useState } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';

import { LpPositionInfo } from './LpPositionInfo';
import { TokenInfo } from './types';
import { usePoolOperations } from './usePoolOperations';

// ticksize deciaml 기준인데 decimal만 조정하면 ticksize 변화 보여주기
// lot size quantity decimal 기준으로 굳이 보여주지 않기
// 전체 ui 순서 조정 및 글래스 모피즘
// base quote asset 가독성 개선
// asset 비율(처음 )

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
  onSubmit,
  token0,
  token1,
}) => {
  const { api } = useApi();
  // If token info is missing, do not render the modal
  if (!token0 || !token1) {
    console.warn('Token information missing');
    return null;
  }
  const { addLiquidity, getLpTokenBalance, removeLiquidity, getPoolQueryRpc } =
    usePoolOperations();
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

  // Add helper function to extract numeric ID consistently
  const extractId = (x: any): number => {
    if (typeof x === 'object' && x !== null && 'WithId' in x) {
      return Number(x.WithId);
    } else if (typeof x === 'number') {
      return x;
    } else {
      return Number(x);
    }
  };

  // 유틸리티 함수 - 여러 곳에서 재사용됨
  const extractBalance = (json: any): bigint => {
    if (
      json &&
      typeof json === 'object' &&
      'balance' in json &&
      typeof json.balance === 'string'
    ) {
      return BigInt(json.balance);
    }
    return 0n;
  };

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setAmount0('');
      setAmount1('');
      setPriceRatio(null);
    }
  }, [isOpen]);

  useEffect(() => {
    async function fetchBalances() {
      if (!api || !selectedAccount) return;

      try {
        // Extract numeric IDs
        const id0 = extractId(token0.id);
        const id1 = extractId(token1.id);

        // 토큰 메타데이터 조회
        const meta0 = await api.query.assets.metadata(id0);
        const meta1 = await api.query.assets.metadata(id1);
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
        const balance0 = await api.query.assets.account(id0, selectedAccount);
        const balance1 = await api.query.assets.account(id1, selectedAccount);

        const bal0 = extractBalance(balance0.toJSON());
        const bal1 = extractBalance(balance1.toJSON());

        // LP 토큰 잔액 조회 - 실패해도 계속 진행
        try {
          const lpBalance = await getLpTokenBalance(id0, id1, selectedAccount);
          console.log('[DEBUG] getLpTokenBalance result:', lpBalance);

          if (lpBalance > 0n) {
            // LP 토큰 메타데이터 (심볼, 소수점 등) 조회
            const poolInfo = await getPoolQueryRpc(id0, id1);

            if (poolInfo && poolInfo.poolExists && poolInfo.lpTokenId) {
              const lpTokenMeta = await api.query.assets.metadata(poolInfo.lpTokenId);
              const lpTokenMetaHuman = lpTokenMeta.toHuman();
              const lpTokenDecimals =
                typeof lpTokenMetaHuman === 'object' &&
                lpTokenMetaHuman !== null &&
                'decimals' in lpTokenMetaHuman
                  ? Number(lpTokenMetaHuman.decimals)
                  : 18; // Default LP token decimals

              // LP 토큰 심볼 추출
              const lpTokenSymbol =
                typeof lpTokenMetaHuman === 'object' &&
                lpTokenMetaHuman !== null &&
                'symbol' in lpTokenMetaHuman
                  ? String(lpTokenMetaHuman.symbol)
                  : 'LP';

              // 보기 좋게 형식화된 잔액
              const formattedLpBalance = (
                Number(lpBalance) / Math.pow(10, lpTokenDecimals)
              ).toLocaleString(undefined, {
                maximumFractionDigits: lpTokenDecimals,
              });

              // LP 보유량의 풀 내 지분 비율 계산
              // (예시: 상세 계산은 체인/UI 요구사항에 따라 달라질 수 있음)
              let lpPercentage = 0;

              // ... (추가 LP 지분 계산 로직)

              // LP 토큰 정보 저장
              setLpTokenBalance({
                lpTokenId: poolInfo.lpTokenId,
                rawBalance: lpBalance.toString(),
                humanReadableBalance: Number(lpBalance) / Math.pow(10, lpTokenDecimals),
                lpTokenSymbol,
                lpTokenDecimals,
                baseAssetId: id0,
                quoteAssetId: id1,
              });

              setLpTokenPercentage(lpPercentage);
            }
          }
        } catch (err) {
          console.warn('LP token balance fetch failed, but continuing:', err);
          // Silent failure for LP token - this allows the modal to work for new pools
        }

        // 사용자 친화적인 형식으로 잔액 표시
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

        return { bal0, bal1 };
      } catch (error) {
        console.error('잔액 및 풀 정보 조회 중 오류:', error);
        // Show user-friendly balances even on error
        setDisplayBalance0('0');
        setDisplayBalance1('0');
        return { bal0: 0n, bal1: 0n };
      }
    }

    if (isOpen) {
      fetchBalances();
    }
  }, [
    isOpen,
    api,
    selectedAccount,
    token0.id,
    token1.id,
    getPoolQueryRpc,
    getLpTokenBalance,
  ]);

  useEffect(() => {
    async function fetchPriceRatio() {
      if (!api || !token0 || !token1) return;

      try {
        // Extract numeric IDs
        const id0 = extractId(token0.id);
        const id1 = extractId(token1.id);

        // Use getPoolQueryRpc function to fetch price ratio
        // This function handles cases where pools don't exist
        const ratio = await getPoolQueryRpc(id0, id1);

        if (ratio === 1) {
          console.log('[fetchPriceRatio] 대체 비율 사용:', ratio);
        }

        setPriceRatio(ratio);

        // Adjust amounts based on new ratio if either one is filled
        if (amount0 && !amount1 && Number(amount0) > 0) {
          const newAmount1 = (Number(amount0) * ratio).toFixed(6);
          setAmount1(newAmount1);
        } else if (amount1 && !amount0 && Number(amount1) > 0) {
          const newAmount0 = (Number(amount1) / ratio).toFixed(6);
          setAmount0(newAmount0);
        }

        return ratio;
      } catch (error) {
        console.error('[fetchPriceRatio] Error fetching price ratio:', error);
        // Use default ratio (1) as fallback
        setPriceRatio(1);
        return 1;
      }
    }

    if (isOpen && token0 && token1 && api) {
      fetchPriceRatio();
    }
  }, [isOpen, token0, token1, api, getPoolQueryRpc]);

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
        if (!isNaN(parsedValue)) {
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

        // Extract numeric IDs
        const id0 = extractId(token0.id);
        const id1 = extractId(token1.id);

        // 그루핑을 위해 풀 정보 가져오기
        const poolInfo = await getPoolQueryRpc(id0, id1);
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
          { WithId: id0 },
          { WithId: id1 },
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

      // Extract numeric IDs
      const id0 = extractId(token0.id);
      const id1 = extractId(token1.id);

      const meta0 = await api.query.assets.metadata(id0);
      const meta1 = await api.query.assets.metadata(id1);
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
      const balance0 = await api.query.assets.account(id0, selectedAccount);
      const balance1 = await api.query.assets.account(id1, selectedAccount);
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

          // Get numeric IDs for current tokens
          const id0 = extractId(token0.id);
          const id1 = extractId(token1.id);

          const keyArr = Array.isArray(keyHuman[0]) ? keyHuman[0] : keyHuman;
          const baseAssetId = extractId(keyArr[0]);
          const quoteAssetId = extractId(keyArr[1]);

          // 두 방향 모두 체크: (token0, token1) 또는 (token1, token0)
          if (baseAssetId === id0 && quoteAssetId === id1) {
            if (valueHuman) {
              poolExists = true;
              poolOrder = 'token0-token1';
              break;
            }
          } else if (baseAssetId === id1 && quoteAssetId === id0) {
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
          id0,
          id1,
          Number(rawAmount0),
          Number(rawAmount1),
          selectedAccount,
        );
      } else if (poolOrder === 'token1-token0') {
        await addLiquidity(
          id1,
          id0,
          Number(rawAmount1),
          Number(rawAmount0),
          selectedAccount,
        );
      }
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit({ token0: Number(amount0), token1: Number(amount1) });
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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="fixed inset-0 bg-black opacity-70" onClick={onClose}></div>
      <div className="z-10 bg-[#151516] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {type === 'add' ? 'Add Liquidity' : 'Remove Liquidity'} - {poolName}
          </h2>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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
        {isLoading ? (
          <div className="text-blue-400 text-center my-4">Loading pool information...</div>
        ) : poolInfo && !poolInfo.poolExists ? (
          <div className="text-yellow-500 text-center my-4">
            No liquidity pool exists for this token pair yet.
            <br />
            You will be creating a new pool with your first deposit.
          </div>
        ) : null}

        {/* LP 포지션 정보 - 풀/LP가 있을 때만 */}
        {lpTokenBalance &&
          lpTokenBalance.lpTokenId !== 0 &&
          poolInfo &&
          poolInfo.poolExists && (
            <LpPositionInfo
              lpTokenBalance={lpTokenBalance}
              token0Symbol={token0.symbol}
              token1Symbol={token1.symbol}
              lpTokenPercentage={lpTokenPercentage}
              poolInfo={poolInfo}
              formattedLpBalance={
                formattedLpBalance ||
                lpTokenBalance.humanReadableBalance?.toLocaleString(undefined, {
                  maximumFractionDigits: lpTokenBalance.lpTokenDecimals || 6,
                }) ||
                '0'
              }
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
