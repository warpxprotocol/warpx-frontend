import { useParams } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { useApi } from '@/hooks/useApi';

import { usePoolOperations } from './components/pools/usePoolOperations';

// 인터페이스 및 타입 정의
interface LpTokenBalanceType {
  lpTokenId?: number;
  rawBalance?: string;
  humanReadableBalance?: number;
  lpTokenSymbol?: string;
  lpTokenDecimals?: number;
  baseAssetId?: number;
  quoteAssetId?: number;
}

interface PoolInfoType {
  poolExists?: boolean;
  feeTier?: number;
  [key: string]: any;
}

export default function AMMInfoBox() {
  // URL 파라미터 파싱
  const params = useParams();
  const pairParam = params?.pair as string | undefined;
  
  // API 및 계정 정보 가져오기
  const { api } = useApi();
  const { selectedAccount } = useWalletStore();
  const { getLpTokenBalance, getPoolInfo } = usePoolOperations();

  // 상태 관리
  const [lpTokenBalance, setLpTokenBalance] = useState<LpTokenBalanceType | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfoType | null>(null);
  const [lpTokenPercentage, setLpTokenPercentage] = useState<number>(0);
  const [token0Symbol, setToken0Symbol] = useState<string>('');
  const [token1Symbol, setToken1Symbol] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 가져오기
  useEffect(() => {
    let isMounted = true;
    
    if (!pairParam) {
      setLoading(false);
      return;
    }
    
    if (!api || !selectedAccount) {
      if (isMounted) {
        setLoading(false);
        setError('API or account not available');
      }
      return;
    }

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // URL에서 토큰 ID 추출
        const pairParts = pairParam.split('-');
        if (pairParts.length !== 2) {
          throw new Error('Invalid pair format in URL');
        }
        
        const [baseSymbol, quoteSymbol] = pairParts;
        if (!baseSymbol || !quoteSymbol) {
          throw new Error('Missing token symbols in pair');
        }

        if (isMounted) {
          setToken0Symbol(baseSymbol);
          setToken1Symbol(quoteSymbol);
        }

        // 심볼에 해당하는 토큰 ID 찾기
        const assetsData = await api.query.assets.metadata.entries();
        
        if (!isMounted) return;
        
        let baseId: number | null = null;
        let quoteId: number | null = null;

        for (const entry of assetsData) {
          try {
            const id = entry[0].args[0];
            const meta = entry[1].toHuman();
            if (meta && typeof meta === 'object' && 'symbol' in meta) {
              const symbol = String(meta.symbol || '');
              if (symbol === baseSymbol) baseId = Number(id);
              if (symbol === quoteSymbol) quoteId = Number(id);
              if (baseId !== null && quoteId !== null) break;
            }
          } catch (err) {
            console.error('Error processing asset entry:', err);
          }
        }

        if (!isMounted) return;
        
        if (baseId === null || quoteId === null) {
          throw new Error(`Could not find token IDs for symbols: ${baseSymbol}, ${quoteSymbol}`);
        }

        // 풀 정보 가져오기
        let poolInfoData: PoolInfoType | null = null;
        try {
          poolInfoData = await getPoolInfo(baseId, quoteId);
          if (isMounted && poolInfoData) {
            setPoolInfo(poolInfoData);
          }
        } catch (err) {
          console.error('Error fetching pool info:', err);
          if (isMounted) {
            setError('Failed to fetch pool information');
          }
        }

        if (!isMounted) return;
        
        // poolInfoData가 존재하고 poolExists가 true인 경우에만 LP 토큰 정보 가져오기
        if (poolInfoData && poolInfoData.poolExists) {
          try {
            // LP 토큰 잔액 가져오기
            const lpBalance = await getLpTokenBalance(baseId, quoteId, selectedAccount);
            
            if (!isMounted) return;
            
            if (lpBalance) {
              setLpTokenBalance(lpBalance);

              // LP 토큰 비율 계산 (lpTokenId가 존재하는 경우만)
              if (lpBalance.lpTokenId) {
                try {
                  const totalSupplyInfo = await api.query.assets.asset(lpBalance.lpTokenId);
                  
                  if (!isMounted) return;
                  
                  if (totalSupplyInfo) {
                    const totalSupplyData = totalSupplyInfo.toJSON();
                    if (
                      totalSupplyData &&
                      typeof totalSupplyData === 'object' &&
                      'supply' in totalSupplyData
                    ) {
                      try {
                        const totalSupply = BigInt(String(totalSupplyData.supply || '0'));
                        if (totalSupply > 0n) {
                          const userRawBalance = BigInt(String(lpBalance.rawBalance || '0'));
                          const percentage = (Number(userRawBalance) / Number(totalSupply)) * 100;
                          if (isMounted && !isNaN(percentage)) {
                            setLpTokenPercentage(percentage);
                          }
                        }
                      } catch (err) {
                        console.error('Error in BigInt conversion:', err);
                      }
                    }
                  }
                } catch (err) {
                  console.error('Error calculating LP token percentage:', err);
                }
              }
            }
          } catch (err) {
            console.error('Error fetching LP token balance:', err);
            if (isMounted) {
              setError('Failed to fetch LP token balance');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching AMMInfoBox data:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [api, selectedAccount, pairParam, getLpTokenBalance, getPoolInfo]);

  // LP 토큰 잔액 포맷팅
  const formattedLpBalance = useMemo(() => {
    if (!lpTokenBalance || lpTokenBalance.humanReadableBalance === undefined || lpTokenBalance.humanReadableBalance === null) {
      return '0';
    }
    try {
      return Number(lpTokenBalance.humanReadableBalance).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (e) {
      console.error('Error formatting LP balance:', e);
      return '0';
    }
  }, [lpTokenBalance]);

  // URL에 페어 정보가 없는 경우 처리
  if (!pairParam) {
    return (
      <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
        <div className="text-gray-400 text-sm">Select a pool to view details</div>
      </div>
    );
  }
  
  // 에러 발생 시 처리
  if (error) {
    return (
      <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }
  
  // 메인 렌더링
  return (
    <div className="relative bg-[#18181C] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[260px] w-full">
      {/* 상단: PRICE / DEPTH */}
      <div className="flex w-full justify-between items-center mb-0.5">
        <span className="text-gray-400 text-xs font-medium tracking-widest">PRICE</span>
        <span className="text-gray-400 text-xs font-medium tracking-widest">DEPTH</span>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <span className="text-gray-400 text-sm">Loading pool information...</span>
        </div>
      ) : (
        <>
          {/* 중앙: 가격/USDT, 우측 페어 */}
          <div className="flex w-full items-center justify-between mb-1">
            <div className="flex items-end">
              <span className="text-xl font-semibold text-white leading-none">4.070676</span>
              <span className="ml-1 text-xs text-gray-400 font-medium">USDT</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between">
                  <span className="text-white text-base mr-1">🟣</span>
                  <span className="text-white font-medium text-xs">2,943.49</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded px-1.5 py-0.5 flex items-center min-w-[70px] justify-between">
                  <span className="text-white text-base mr-1">🟦</span>
                  <span className="text-white font-medium text-xs">11,980</span>
                </span>
              </div>
            </div>
          </div>

          {/* LP 토큰 정보 섹션 */}
          {lpTokenBalance && (
            <div className="mt-3 border-t border-gray-800 pt-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-white text-sm font-medium">Your LP Position</h3>
                <div className="text-xs text-blue-400">
                  {token0Symbol}/{token1Symbol}
                </div>
              </div>

              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 text-xs">Balance:</span>
                <span className="text-white text-sm">
                  {formattedLpBalance} {lpTokenBalance?.lpTokenSymbol || ''}
                </span>
              </div>

              {lpTokenPercentage > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">Pool Share:</span>
                  <span className="text-white text-sm">{lpTokenPercentage.toFixed(2)}%</span>
                </div>
              )}

              {poolInfo && poolInfo.poolExists && typeof poolInfo.feeTier === 'number' && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">Pool Fee:</span>
                  <span className="text-white text-sm">
                    {(poolInfo.feeTier / 100).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 하단: AMM, V2 뱃지 */}
      <div className="flex w-full mt-0 gap-1">
        <span className="bg-[#23232A] text-[10px] text-white font-semibold rounded px-1.5 py-0.5">
          AMM
        </span>
        <span className="bg-gray-600 text-[10px] text-white font-semibold rounded px-1.5 py-0.5">
          V2
        </span>
      </div>
    </div>
  );
}
