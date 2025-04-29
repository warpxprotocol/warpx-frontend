import { Signer } from '@polkadot/api/types';
import { useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';
import { getAccountSigner } from './utils';

/**
 * 풀 생성 관련 함수를 제공하는 훅
 */
export const usePoolCreation = () => {
  const { api } = useApi();
  const { handleExtrinsic } = useExtrinsic();

  /**
   * 새로운 AMM 풀 생성 함수
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @param initialBaseAmount 초기 기본 토큰 금액
   * @param initialQuoteAmount 초기 쿠팅 토큰 금액
   * @param feeTier 수수료 등급
   * @param address 사용자 주소
   * @param selectedAccountObj 선택된 계정 객체
   * @returns 트랜잭션 해시
   */
  const createPool = useCallback(
    async (
      baseAssetId: number,
      quoteAssetId: number,
      initialBaseAmount: number,
      initialQuoteAmount: number,
      feeTier: number,
      address: string,
      selectedAccountObj?: any,
    ): Promise<string> => {
      if (!api) throw new Error('API not connected');
      
      try {
        console.log(
          '[createPool] Creating pool:',
          'baseAssetId:',
          baseAssetId,
          'quoteAssetId:',
          quoteAssetId,
          'initialBaseAmount:',
          initialBaseAmount,
          'initialQuoteAmount:',
          initialQuoteAmount,
          'feeTier:',
          feeTier,
        );
        
        // 서명자 가져오기
        const { signer } = await getAccountSigner(address, selectedAccountObj);
        
        // 풀 생성 extrinsic 생성
        const extrinsic = api.tx.hybridOrderbook.createPool(
          baseAssetId,
          quoteAssetId,
          initialBaseAmount,
          initialQuoteAmount,
          feeTier,
        );
        
        // 상태 메시지 정의
        const txMessages = {
          pending: 'Creating pool...',
          success: 'Pool created successfully',
          error: 'Failed to create pool',
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
                  console.log(`[createPool] Transaction included in block with hash: ${txHash}`);
                  // 성공 처리, 해시 반환
                  resolve(txHash);
                } else {
                  // 오류 처리
                  let errorMessage = txMessages.error;
                  if (dispatchError.isModule) {
                    const decoded = extrinsic.registry.findMetaError(dispatchError.asModule);
                    errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                  }
                  console.error(`[createPool] Transaction error: ${errorMessage}`);
                  reject(new Error(errorMessage));
                }
              }
            })
            .catch((error) => {
              console.error('[createPool] Signing error:', error);
              reject(error);
            });
        });
      } catch (error) {
        console.error('[createPool] Error creating pool:', error);
        throw new Error(`Failed to create pool: ${error}`);
      }
    },
    [api, handleExtrinsic],
  );

  return {
    createPool,
  };
};
