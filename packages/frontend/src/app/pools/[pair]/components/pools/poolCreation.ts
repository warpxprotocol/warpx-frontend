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
   * @param baseDecimals 기본 토큰 소수점 자릿수
   * @param quoteAssetId 쿠팅 토큰 ID
   * @param quoteDecimals 쿠팅 토큰 소수점 자릿수
   * @param takerFeeRate 수수료 등급 (백분율, %)
   * @param tickSize 최소 가격 변동 단위
   * @param lotSize 최소 거래 단위
   * @param poolDecimals 풀 토큰 소수점 자릿수
   * @param address 사용자 주소
   * @param selectedAccountObj 선택된 계정 객체
   * @returns 트랜잭션 해시
   */
  const createPool = useCallback(
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

      try {
        // 문자열 입력을 숫자로 변환
        const takerFeeRateNumber = Number(takerFeeRate);
        const tickSizeNumber = Number(tickSize);
        const lotSizeNumber = Number(lotSize);
        const poolDecimalsNumber = Number(poolDecimals);

        // takerFeeRate를 Permill로 변환 (백분율 → 백만분율)
        // 예: 0.03% → 300 Permill (0.03% = 0.0003 = 300/1,000,000)
        const takerFeeRatePermill = Math.floor(takerFeeRateNumber * 10000);

        console.log(
          '[createPool] Creating pool:',
          'baseAssetId:',
          baseAssetId,
          'baseDecimals:',
          baseDecimals,
          'quoteAssetId:',
          quoteAssetId,
          'quoteDecimals:',
          quoteDecimals,
          'takerFeeRate:',
          takerFeeRateNumber,
          'takerFeeRatePermill:',
          takerFeeRatePermill,
          'tickSize:',
          tickSizeNumber,
          'lotSize:',
          lotSizeNumber,
          'poolDecimals:',
          poolDecimalsNumber,
        );

        // 서명자 가져오기
        const { signer } = await getAccountSigner(address, selectedAccountObj);

        // 풀 생성 extrinsic 생성 - 업데이트된 SDK 형식 사용
        const extrinsic = api.tx.hybridOrderbook.createPool(
          { WithId: baseAssetId },
          baseDecimals,
          { WithId: quoteAssetId },
          quoteDecimals,
          takerFeeRatePermill,
          tickSizeNumber,
          lotSizeNumber,
          poolDecimalsNumber,
        );

        // 상태 메시지 정의
        const txMessages = {
          pending: 'Creating pool...',
          success: 'Pool created successfully',
          error: 'Failed to create pool',
        };

        // handleExtrinsic을 사용하여 트랜잭션 처리
        const result = (await handleExtrinsic(
          extrinsic,
          { signer, account: address },
          txMessages,
        )) as {
          status: {
            isFinalized: boolean;
            asFinalized: { toString: () => string };
            asInBlock: { toString: () => string };
          };
        };

        // 트랜잭션 해시 반환
        return result.status.isFinalized
          ? result.status.asFinalized.toString()
          : result.status.asInBlock.toString();
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
