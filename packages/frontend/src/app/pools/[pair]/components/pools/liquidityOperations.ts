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
        console.log(
          '[addLiquidity] Adding liquidity:',
          'baseAssetId:',
          baseAssetId,
          'quoteAssetId:',
          quoteAssetId,
          'baseAmount:',
          baseAmount,
          'quoteAmount:',
          quoteAmount,
        );

        // 서명자 가져오기
        const { signer } = await getAccountSigner(address, selectedAccountObj);

        // 자산 ID를 WithId 형식으로 변환
        const baseAsset = { WithId: baseAssetId };
        const quoteAsset = { WithId: quoteAssetId };

        // 모든 금액을 문자열로 변환 (u128에는 문자열로 전달해야 함)
        const baseAmountStr = baseAmount.toString();
        const quoteAmountStr = quoteAmount.toString();

        // 슬리피지 방지용 최소 금액 (예: 원하는 금액의 99%)
        // BigInt를 사용하여 대용량 정수 계산
        const baseAmountBig = BigInt(baseAmount);
        const quoteAmountBig = BigInt(quoteAmount);
        const baseAmountMinStr = ((baseAmountBig * BigInt(99)) / BigInt(100)).toString();
        const quoteAmountMinStr = ((quoteAmountBig * BigInt(99)) / BigInt(100)).toString();

        console.log(
          '[addLiquidity] Formatted parameters (as strings):',
          'baseAsset:',
          JSON.stringify(baseAsset),
          'quoteAsset:',
          JSON.stringify(quoteAsset),
          'baseAmountDesired:',
          baseAmountStr,
          'quoteAmountDesired:',
          quoteAmountStr,
          'baseAmountMin:',
          baseAmountMinStr,
          'quoteAmountMin:',
          quoteAmountMinStr,
          'mintTo:',
          address,
        );

        // 유동성 추가 extrinsic 생성 (모든 금액은 문자열로 전달)
        const extrinsic = api.tx.hybridOrderbook.addLiquidity(
          baseAsset,
          quoteAsset,
          baseAmountStr,
          quoteAmountStr,
          baseAmountMinStr,
          quoteAmountMinStr,
          address,
        );

        // handleExtrinsic 함수 사용
        const result = await handleExtrinsic(
          extrinsic,
          { signer, account: address },
          {
            pending: 'Adding liquidity...',
            success: 'Liquidity added successfully',
            error: 'Failed to add liquidity',
          },
        );

        // 트랜잭션 해시 반환
        const blockHash = (
          result as unknown as {
            status: { isFinalized: boolean; asFinalized: string; asInBlock: string };
          }
        ).status.isFinalized
          ? (
              result as unknown as {
                status: { isFinalized: boolean; asFinalized: string; asInBlock: string };
              }
            ).status.asFinalized.toString()
          : (
              result as unknown as {
                status: { isFinalized: boolean; asFinalized: string; asInBlock: string };
              }
            ).status.asInBlock.toString();

        console.log('[addLiquidity] Transaction successful with hash:', blockHash);
        return blockHash;
      } catch (error) {
        console.error('[addLiquidity] Error adding liquidity:', error);
        throw new Error(`Failed to add liquidity: ${error}`);
      }
    },
    [api, handleExtrinsic],
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
                  console.log(
                    `[removeLiquidity] Transaction included in block with hash: ${txHash}`,
                  );
                  // 성공 처리, 해시 반환
                  resolve(txHash);
                } else {
                  // 오류 처리
                  let errorMessage = txMessages.error;
                  if (dispatchError.isModule) {
                    const decoded = extrinsic.registry.findMetaError(
                      dispatchError.asModule,
                    );
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

  /**
   * 풀 생성 + 최소 유동성 추가를 batch로 처리
   */
  const createPoolWithInitialLiquidity = useCallback(
    async (
      baseAssetId: number,
      baseDecimals: number,
      quoteAssetId: number,
      quoteDecimals: number,
      takerFeeRate: string,
      tickSize: string,
      lotSize: string,
      poolDecimals: string,
      address: string,
      selectedAccountObj?: any,
    ): Promise<string> => {
      if (!api) throw new Error('API not connected');

      // 1. createPool extrinsic
      const takerFeeRateNumber = Number(takerFeeRate);
      const tickSizeNumber = Number(tickSize);
      const lotSizeNumber = Number(lotSize);
      const poolDecimalsNumber = Number(poolDecimals);
      const takerFeeRatePermill = Math.floor(takerFeeRateNumber * 10000);

      const createPoolTx = api.tx.hybridOrderbook.createPool(
        { WithId: baseAssetId },
        baseDecimals,
        { WithId: quoteAssetId },
        quoteDecimals,
        takerFeeRatePermill,
        tickSizeNumber,
        lotSizeNumber,
        poolDecimalsNumber,
      );

      // 2. 최소 유동성 값 (예: 1, 1)
      const baseAmount = 1;
      const quoteAmount = 1;
      const addLiquidityTx = api.tx.hybridOrderbook.addLiquidity(
        { WithId: baseAssetId },
        { WithId: quoteAssetId },
        baseAmount.toString(),
        quoteAmount.toString(),
        baseAmount.toString(),
        quoteAmount.toString(),
        address,
      );

      // 3. batch extrinsic
      const batchTx = api.tx.utility.batch([createPoolTx, addLiquidityTx]);

      // 4. 서명자
      const { signer } = await getAccountSigner(address, selectedAccountObj);

      // 5. 트랜잭션 처리
      const txMessages = {
        pending: 'Creating pool and adding initial liquidity...',
        success: 'Pool created and initial liquidity added!',
        error: 'Failed to create pool or add liquidity',
      };

      const result = await handleExtrinsic(
        batchTx,
        { signer, account: address },
        txMessages,
      );

      const status = (result as any).status;
      if (status?.isFinalized) {
        return status.asFinalized.toString();
      } else if (status?.isInBlock) {
        return status.asInBlock.toString();
      }
      return '';
    },
    [api, handleExtrinsic],
  );

  return {
    addLiquidity,
    removeLiquidity,
    createPoolWithInitialLiquidity,
  };
};
