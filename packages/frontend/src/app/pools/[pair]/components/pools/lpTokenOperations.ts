import { useCallback } from 'react';

import { useApi } from '@/hooks/useApi';

import { usePoolQueries } from './poolQueries';
import { extractBalance } from './utils';

/**
 * LP 토큰 관련 작업을 위한 훅
 */
export const useLpTokenOperations = () => {
  const { api } = useApi();
  const { findPoolIndexByPair, getPoolQueryRpc } = usePoolQueries();

  /**
   * LP 토큰 ID 찾기 함수
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @returns LP 토큰 ID
   */
  const findLpTokenId = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<number> => {
      if (!api) throw new Error('API not connected');

      try {
        // 페어를 사용하여 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseAssetId, quoteAssetId);

        if (poolIndex === null) {
          throw new Error('Pool not found for the given pair');
        }

        // 풀 인덱스로 풀 정보 가져오기
        const poolInfo = await getPoolQueryRpc(baseAssetId, quoteAssetId);

        if (!poolInfo.poolExists || !poolInfo.lpTokenId) {
          throw new Error('LP token ID not found for the given pair');
        }

        return poolInfo.lpTokenId;
      } catch (error) {
        console.error('[findLpTokenId] Error finding LP token ID:', error);
        throw new Error(`Failed to find LP token ID: ${error}`);
      }
    },
    [api, findPoolIndexByPair, getPoolQueryRpc],
  );

  /**
   * LP 토큰 잔액 조회 함수
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @param accountAddress 사용자 주소
   * @returns LP 토큰 잔액 정보
   */
  const getLpTokenBalance = useCallback(
    async (
      baseAssetId: number,
      quoteAssetId: number,
      accountAddress: string,
    ): Promise<bigint> => {
      if (!api) throw new Error('API not connected');

      try {
        // LP 토큰 ID 찾기
        const lpTokenId = await findLpTokenId(baseAssetId, quoteAssetId);
        if (!lpTokenId) {
          throw new Error('LP token ID not found');
        }

        // 해당 토큰 잔액 조회
        const balanceData = await api.query.assets.account(lpTokenId, accountAddress);

        // 잔액 추출
        return extractBalance(balanceData);
      } catch (error) {
        console.error('[getLpTokenBalance] Error getting LP token balance:', error);
        throw new Error(`Failed to get LP token balance: ${error}`);
      }
    },
    [api, findLpTokenId],
  );

  return {
    findLpTokenId,
    getLpTokenBalance,
  };
};
