import { useLiquidityOperations } from './liquidityOperations';
import { useLpTokenOperations } from './lpTokenOperations';
import { usePoolCreation } from './poolCreation';
import { usePoolQueries } from './poolQueries';

/**
 * 풀 관련 모든 작업을 통합적으로 제공하는 훅
 * 이 훅은 여러 특화된 훅들을 조합해 기존 인터페이스를 유지합니다.
 */

export const usePoolOperations = () => {
  // 각 특화된 훅들 불러오기
  const { findPoolIndexByPair, getPoolQueryRpc } = usePoolQueries();

  const { findLpTokenId, getLpTokenBalance } = useLpTokenOperations();

  const { createPool } = usePoolCreation();

  const { addLiquidity, removeLiquidity } = useLiquidityOperations();

  // 기존 인터페이스를 유지하기 위해 모든 함수 반환
  return {
    // 풀 쿼리 기능
    findPoolIndexByPair,
    getPoolQueryRpc,

    // LP 토큰 기능
    findLpTokenId,
    getLpTokenBalance,

    // 풀 생성 기능
    createPool,

    // 유동성 관리 기능
    addLiquidity,
    removeLiquidity,
  };
};
