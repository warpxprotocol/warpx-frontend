import { Signer } from '@polkadot/api/types';
import { useCallback } from 'react';

import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';

import { usePoolQueries } from './poolQueries';
import { getAccountSigner } from './utils';

/**
 * 유동성 추가/제거 관련 함수를 제공하는 훅
 */
export const useLiquidityOperations = () => {
  const { api } = useApi();
  const { handleExtrinsic } = useExtrinsic();
  const { findPoolIndexByPair } = usePoolQueries();

  /**
   * 유동성 풀에 토큰 추가하기
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @param baseAmount 기본 토큰 금액
   * @param quoteAmount 쿠팅 토큰 금액
   * @param address 사용자 주소
   * @param selectedAccountObj 선택된 계정 객체
   * @returns 트랜잭션 해시
   */
  const addLiquidity = useCallback(
    async (
      baseAssetId: number,
      quoteAssetId: number,
      baseAmount: number,
      quoteAmount: number,
      address: string,
      selectedAccountObj?: any,
    ): Promise<string> => {
      if (!api) throw new Error('API not connected');

      try {
        // 풀 인덱스 찾기
        const poolIndex = await findPoolIndexByPair(baseAssetId, quoteAssetId);

        if (poolIndex === null) {
          throw new Error('Pool not found for the given pair');
        }

        console.log(
          '[addLiquidity] Adding to pool:',
          'poolIndex:',
          poolIndex,
          'baseAmount:',
          baseAmount,
          'quoteAmount:',
          quoteAmount,
        );

        // 서명자 가져오기
        const { signer } = await getAccountSigner(address, selectedAccountObj);

        // 유동성 추가 extrinsic 생성
        const extrinsic = api.tx.hybridOrderbook.addLiquidity(
          poolIndex,
          baseAmount,
          quoteAmount,
        );

        // 상태 메시지 정의
        const txMessages = {
          pending: 'Adding liquidity...',
          success: 'Liquidity added successfully',
          error: 'Failed to add liquidity',
        };

        // 서명 및 전송 직접 호출 (발송된 해시 값 반환)
        return new Promise((resolve, reject) => {
          extrinsic
            .signAndSend(address, { signer }, ({ status, events, dispatchError }) => {
              if (status.isInBlock || status.isFinalized) {
                // 트랜잭션 해시 가져오기
                const txHash = extrinsic.hash.toString();

                // 오류 없이 성공한 경우
                if (!dispatchError) {
                  console.log(`[addLiquidity] Transaction included in block with hash: ${txHash}`);
                  // 성공 처리, 해시 반환
                  resolve(txHash);
                } else {
                  // 오류 처리
                  let errorMessage = txMessages.error;
                  if (dispatchError.isModule) {
                    const decoded = extrinsic.registry.findMetaError(dispatchError.asModule);
                    errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                  }
                  console.error(`[addLiquidity] Transaction error: ${errorMessage}`);
                  reject(new Error(errorMessage));
                }
              }
            })
            .catch((error) => {
              console.error('[addLiquidity] Signing error:', error);
              reject(error);
            });
        });
      } catch (error) {
        console.error('[addLiquidity] Error adding liquidity:', error);
        throw new Error(`Failed to add liquidity: ${error}`);
      }
    },
    [api, findPoolIndexByPair],
  );

  /**
   * 유동성 풀에서 토큰 제거하기 (원본 함수와 호환성 유지)
   * @param baseAssetId 기본 자산 ID (WithId 객체로 전달됨)
   * @param quoteAssetId 쿠팅 자산 ID (WithId 객체로 전달됨)
   * @param lpAmount LP 토큰 출금량
   * @param minBaseAmount 최소 기본 자산 반환량
   * @param minQuoteAmount 최소 쿠트 자산 반환량
   * @param to 자산을 받을 주소
   * @param withdrawer 출금을 요청한 주소 (선택적)
   * @returns extrinsic 처리 결과
   */
  const removeLiquidity = useCallback(
    async (
      baseAssetId: { WithId: number },
      quoteAssetId: { WithId: number },
      lpAmount: string,
      minBaseAmount: string,
      minQuoteAmount: string,
      to: string,
      withdrawer?: string,
    ) => {
      if (!api) throw new Error('API not connected');

      try {
        // 서명자 가져오기
        const address = withdrawer || to;
        const { signer } = await getAccountSigner(address);

        // 유동성 철회 extrinsic 생성
        const extrinsic = api.tx.hybridOrderbook.removeLiquidity(
          baseAssetId,
          quoteAssetId,
          lpAmount,
          minBaseAmount,
          minQuoteAmount,
          to,
        );

        // 상태 메시지 정의
        const txMessages = {
          pending: 'Removing liquidity...',
          success: 'Liquidity removed successfully',
          error: 'Failed to remove liquidity',
        };

        // 서명 및 전송 직접 호출 (발송된 해시 값 반환)
        return new Promise((resolve, reject) => {
          extrinsic
            .signAndSend(address, { signer }, ({ status, events, dispatchError }) => {
              if (status.isInBlock || status.isFinalized) {
                // 트랜잭션 해시 가져오기
                const txHash = extrinsic.hash.toString();

                // 오류 없이 성공한 경우
                if (!dispatchError) {
                  console.log(`[removeLiquidity] Transaction included in block with hash: ${txHash}`);
                  // 성공 처리, 해시 반환
                  resolve(txHash);
                } else {
                  // 오류 처리
                  let errorMessage = txMessages.error;
                  if (dispatchError.isModule) {
                    const decoded = extrinsic.registry.findMetaError(dispatchError.asModule);
                    errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                  }
                  console.error(`[removeLiquidity] Transaction error: ${errorMessage}`);
                  reject(new Error(errorMessage));
                }
              }
            })
            .catch((error) => {
              console.error('[removeLiquidity] Signing error:', error);
              reject(error);
            });
        });
      } catch (error) {
        console.error('[removeLiquidity] Error removing liquidity:', error);
        throw new Error(`Failed to remove liquidity: ${error}`);
      }
    },
    [api],
  );

  return {
    addLiquidity,
    removeLiquidity,
  };
};
