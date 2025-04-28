import { Signer } from '@polkadot/api/types';
import { useCallback } from 'react';

import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';

// TypeScript global patch for injectedWeb3/walletExtension
// (You may move this to a separate global.d.ts file for better maintainability)
declare global {
  interface Window {
    injectedWeb3?: Record<string, any>;
    walletExtension?: any;
  }
}

// 타입 정의

// LP 토큰 관련 타입
interface LpTokenBalance {
  lpTokenId: number;
  rawBalance: string;
  humanReadableBalance: number;
  lpTokenSymbol: string;
  lpTokenDecimals: number;
  baseAssetId: number;
  quoteAssetId: number;
}

// 풀 정보 타입
interface PoolInfo {
  baseAssetId: number;
  quoteAssetId: number;
  reserve0: number;
  reserve1: number;
  lpTokenId: number;
  feeTier: number;
  poolExists: boolean;
}

// 토큰 ID 추출 유틸리티 함수
function extractId(x: any): number {
  if (typeof x === 'object' && x !== null && 'WithId' in x) {
    return Number(x.WithId);
  } else if (typeof x === 'number') {
    return x;
  } else {
    return Number(x);
  }
}

// 자산 메타데이터에서 소수점 추출 함수
function extractDecimals(metaHuman: any): number {
  if (
    typeof metaHuman === 'object' &&
    metaHuman !== null &&
    'decimals' in metaHuman &&
    metaHuman.decimals !== undefined
  ) {
    return Number(metaHuman.decimals);
  }
  return 0;
}

// 잔액 추출 유틸리티 함수
function extractBalance(balanceData: any): bigint {
  if (
    balanceData &&
    typeof balanceData === 'object' &&
    'balance' in balanceData &&
    balanceData.balance !== undefined
  ) {
    return BigInt(balanceData.balance.toString());
  }
  return BigInt(0);
}

// 서명자 찾기 유틸리티 함수
async function getAccountSigner(
  address: string,
  selectedAccountObj?: any,
): Promise<{ signer: Signer; address: string }> {
  // 동적 import를 통해 순환 종속성 방지
  const { web3FromAddress, web3FromSource } = await import('@polkadot/extension-dapp');
  let signer: Signer | undefined = undefined;

  // 1. 주소로 직접 시도
  try {
    const injector = await web3FromAddress(address);
    if (injector?.signer) {
      console.log('[getAccountSigner] Successfully got signer from address');
      if (injector.name) {
        console.log('[getAccountSigner] Extension source:', injector.name);
      }
      return { signer: injector.signer, address };
    }
  } catch (e) {
    console.warn(
      '[getAccountSigner] Failed to get signer from address, trying source method:',
      e,
    );
  }

  // 2. 소스 기반 시도
  // selectedAccountObj에서 소스 정보 추출
  let source = selectedAccountObj?.meta?.source;

  // injectedWeb3에서 찾기
  if (!source && (window as any).injectedWeb3) {
    const injectedEntries = Object.entries((window as any).injectedWeb3);

    if (injectedEntries && injectedEntries.length > 0) {
      // Polkadot.js 확장 찾기
      const polkadotExtension = injectedEntries.find(([_, ext]) => {
        if (
          ext &&
          typeof ext === 'object' &&
          'name' in ext &&
          typeof ext.name === 'string'
        ) {
          return ext.name.toLowerCase().includes('polkadot');
        }
        return false;
      });

      if (
        polkadotExtension &&
        Array.isArray(polkadotExtension) &&
        polkadotExtension.length > 1
      ) {
        const extension = polkadotExtension[1];
        if (extension && typeof extension === 'object' && 'name' in extension) {
          source = extension.name;
          console.log('[getAccountSigner] Found Polkadot.js extension:', source);
        }
      } else if (injectedEntries.length > 0) {
        // 첫 번째 확장 사용
        const firstEntry = injectedEntries[0];
        if (Array.isArray(firstEntry) && firstEntry.length > 1) {
          const extension = firstEntry[1];
          if (extension && typeof extension === 'object' && 'name' in extension) {
            source = extension.name;
            console.log('[getAccountSigner] Using first available extension:', source);
          }
        }
      }
    }
  }

  // walletExtension에서 찾기
  if (!source && (window as any).walletExtension?.selectedWallet) {
    source = (window as any).walletExtension.selectedWallet;
  }

  if (!source) {
    throw new Error('No extension source found for selected account.');
  }

  console.log('[getAccountSigner] Using extension source:', source);
  const injector = await web3FromSource(source);
  if (!injector?.signer) {
    throw new Error(`No signer found for selected account source: ${source}`);
  }

  return { signer: injector.signer, address };
}

export const usePoolOperations = () => {
  const { api } = useApi();
  const { handleExtrinsic } = useExtrinsic();

  /**
   * Add liquidity to an existing pool.
   * @param baseAssetId - { WithId: number }
   * @param quoteAssetId - { WithId: number }
   * @param lpTokenId - { WithId: number }
   * @param amountBase - string (raw units)
   * @param amountQuote - string (raw units)
   * @param minBase - string (raw units, usually same as amountBase)
   * @param minQuote - string (raw units, usually same as amountQuote)
   * @param mintTo - string (AccountId)
   */

  /**
   * 유동성 풀에 토큰 추가
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @param amountBase 기본 토큰 추가량 (raw units)
   * @param amountQuote 쿠팅 토큰 추가량 (raw units)
   * @param minBase 최소 기본 토큰량 (raw units)
   * @param minQuote 최소 쿠팅 토큰량 (raw units)
   * @param mintTo LP 토큰을 받을 계정 주소
   * @param selectedAccountObj 선택된 계정 객체 (선택사항)
   */
  const addLiquidity = useCallback(
    async (
      baseAssetId: { WithId: number },
      quoteAssetId: { WithId: number },
      amountBase: string,
      amountQuote: string,
      minBase: string,
      minQuote: string,
      mintTo: string,
      selectedAccountObj?: any, // (optional) pass the full account object if available
    ) => {
      if (!api) throw new Error('API not connected');

      try {
        // 서명자 가져오기
        const { signer, address } = await getAccountSigner(mintTo, selectedAccountObj);

        // 유동성 추가 extrinsic 생성
        const extrinsic = api.tx.hybridOrderbook.addLiquidity(
          baseAssetId,
          quoteAssetId,
          amountBase,
          amountQuote,
          minBase,
          minQuote,
          mintTo,
        );

        // extrinsic 실행
        return handleExtrinsic(
          extrinsic,
          { account: address, signer },
          {
            pending: 'Adding liquidity...',
            success: 'Liquidity added successfully',
            error: 'Failed to add liquidity',
          },
        );
      } catch (e) {
        console.error('[addLiquidity] Failed to get signer for account', mintTo, e);
        throw new Error(
          'Failed to get signer for selected account. Please check wallet connection.',
        );
      }
    },
    [api, handleExtrinsic],
  );

  // Create new liquidity pool
  /**
   * 새로운 유동성 풀 생성
   * @param token0Id 첫 번째 토큰 ID
   * @param token1Id 두 번째 토큰 ID
   * @param initialAmount0 첫 번째 토큰 초기 수량
   * @param initialAmount1 두 번째 토큰 초기 수량
   * @param feeTier 수수료 등급 (e.g. 30 = 0.3%)
   * @param mintTo LP 토큰을 받을 주소
   */
  const createPool = useCallback(
    async (
      token0Id: number,
      token1Id: number,
      initialAmount0: number,
      initialAmount1: number,
      feeTier: number,
      mintTo?: string,
    ) => {
      if (!api) throw new Error('API not connected');

      try {
        // 서명자 가져오기 (mintTo가 제공된 경우)
        let signer, address;
        if (mintTo) {
          const result = await getAccountSigner(mintTo);
          signer = result.signer;
          address = result.address;
        }

        const extrinsic = api.tx.hybridOrderbook.createPool(
          token0Id,
          token1Id,
          initialAmount0,
          initialAmount1,
          feeTier,
        );

        const options = mintTo && signer ? { account: address, signer } : { useDev: true };

        return handleExtrinsic(extrinsic, options, {
          pending: 'Pool creation in progress...',
          success: 'Pool created successfully',
          error: 'Failed to create pool',
        });
      } catch (error) {
        console.error('[createPool] Error creating pool:', error);
        throw new Error(`Failed to create pool: ${error}`);
      }
    },
    [api, handleExtrinsic],
  );

  // Calculate price ratio between tokens using reserves and decimals
  const getPoolPriceRatio = useCallback(
    async (token0Id: number | string, token1Id: number | string) => {
      // Defensive: Ensure IDs are valid numbers
      const id0 = Number(token0Id);
      const id1 = Number(token1Id);
      if (isNaN(id0) || isNaN(id1)) {
        console.error('[getPoolPriceRatio] Invalid token IDs:', token0Id, token1Id);
        return 1; // fallback ratio
      }
      if (!api) throw new Error('API not connected');
      try {
        console.log('[getPoolPriceRatio] token0Id:', token0Id, 'token1Id:', token1Id);
        const poolsData = await api.query.hybridOrderbook.pools.entries();
        let foundPoolInfo = null;
        for (const entry of poolsData as any[]) {
          const key = entry[0];
          const value = entry[1];
          const keyHuman = typeof key.toHuman === 'function' ? key.toHuman() : undefined;
          const valueHuman =
            typeof value.toHuman === 'function' ? value.toHuman() : undefined;
          console.log('[getPoolPriceRatio] keyHuman:', keyHuman, 'valueHuman:', valueHuman);

          if (!keyHuman || !valueHuman || Object.keys(valueHuman).length === 0) continue;

          // Defensive extraction: try to get base/quote asset IDs from keyHuman
          let poolBaseAssetId, poolQuoteAssetId;
          if (Array.isArray(keyHuman) && Array.isArray(keyHuman[0])) {
            // e.g. [[123, 456], ...]
            poolBaseAssetId = Number(keyHuman[0][0]);
            poolQuoteAssetId = Number(keyHuman[0][1]);
          } else if (Array.isArray(keyHuman) && keyHuman.length >= 2) {
            // e.g. [123, 456]
            poolBaseAssetId = Number(keyHuman[0]);
            poolQuoteAssetId = Number(keyHuman[1]);
          } else if (typeof keyHuman[0] === 'number' && typeof keyHuman[1] === 'number') {
            poolBaseAssetId = keyHuman[0];
            poolQuoteAssetId = keyHuman[1];
          } else {
            console.warn(
              '[getPoolPriceRatio] Could not extract asset IDs from keyHuman:',
              keyHuman,
            );
            continue;
          }
          console.log(
            '[getPoolPriceRatio] poolBaseAssetId:',
            poolBaseAssetId,
            'poolQuoteAssetId:',
            poolQuoteAssetId,
          );

          // Check both directions
          if (
            (poolBaseAssetId === id0 && poolQuoteAssetId === id1) ||
            (poolBaseAssetId === id1 && poolQuoteAssetId === id0)
          ) {
            foundPoolInfo = valueHuman;
            break;
          }
        }
        if (!foundPoolInfo) {
          console.warn(
            '[getPoolPriceRatio] Pool not found for token pair:',
            token0Id,
            token1Id,
          );
          return 1; // fallback
        }
        const reserve0 = foundPoolInfo.reserve0 ? Number(foundPoolInfo.reserve0) : 0;
        const reserve1 = foundPoolInfo.reserve1 ? Number(foundPoolInfo.reserve1) : 0;
        const meta0 = await api.query.assets.metadata(token0Id);
        const meta1 = await api.query.assets.metadata(token1Id);
        const humanMeta0 = meta0.toHuman();
        const humanMeta1 = meta1.toHuman();
        const decimals0 = extractDecimals(humanMeta0);
        const decimals1 = extractDecimals(humanMeta1);
        const price0 = reserve0 / Math.pow(10, decimals0);
        const price1 = reserve1 / Math.pow(10, decimals1);
        if (price0 === 0) return 1;
        return price1 / price0;
      } catch (error) {
        console.error('Price ratio fetch error:', error);
        return 1;
      }
    },
    [api],
  );

  // LP 토큰 ID 찾기 함수
  const findLpTokenId = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<number> => {
      if (!api) throw new Error('API not connected');

      try {
        // 풀 정보를 쿼리하여 LP 토큰 ID 가져오기
        const poolsData = await api.query.hybridOrderbook.pools.entries();

        for (const entry of poolsData as any[]) {
          const key = entry[0];
          const value = entry[1];
          const keyHuman = typeof key.toHuman === 'function' ? key.toHuman() : undefined;
          const valueHuman =
            typeof value.toHuman === 'function' ? value.toHuman() : undefined;
          console.log('[DEBUG][findLpTokenId] Pool keyHuman:', JSON.stringify(keyHuman));
          console.log('[DEBUG][findLpTokenId] Pool valueHuman:', valueHuman);
          const keyArr = Array.isArray(keyHuman[0]) ? keyHuman[0] : keyHuman;
          const poolBaseAssetId = extractId(keyArr[0]);
          const poolQuoteAssetId = extractId(keyArr[1]);
          console.log(
            '[DEBUG][findLpTokenId] Extracted asset IDs:',
            poolBaseAssetId,
            poolQuoteAssetId,
            'Target:',
            baseAssetId,
            quoteAssetId,
          );

          if (
            !Array.isArray(keyHuman) ||
            !valueHuman ||
            Object.keys(valueHuman).length === 0
          )
            continue;

          // 두 방향 모두 체크: (baseAssetId, quoteAssetId) 또는 (quoteAssetId, baseAssetId)
          if (
            (poolBaseAssetId === baseAssetId && poolQuoteAssetId === quoteAssetId) ||
            (poolBaseAssetId === quoteAssetId && poolQuoteAssetId === baseAssetId)
          ) {
            // LP 토큰 ID 추출
            if (valueHuman && typeof valueHuman === 'object' && 'lpToken' in valueHuman) {
              const lpTokenId = extractId(valueHuman.lpToken);

              return lpTokenId;
            }
          }
        }

        throw new Error('LP token ID not found for the given pair');
      } catch (error) {
        console.error('Error finding LP token ID:', error);
        throw new Error(`Failed to find LP token ID: ${error}`);
      }
    },
    [api],
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
    ): Promise<LpTokenBalance> => {
      if (!api) throw new Error('API not connected');
      if (!accountAddress) throw new Error('Account address is required');

      try {
        // 1. 해당 토큰 페어의 LP 토큰 ID 찾기
        const lpTokenId = await findLpTokenId(baseAssetId, quoteAssetId);

        // 2. LP 토큰 메타데이터 가져오기 (소수점 정보)
        const lpTokenMeta = await api.query.assets.metadata(lpTokenId);
        const lpTokenMetaHuman = lpTokenMeta.toHuman();
        const lpTokenDecimals =
          typeof lpTokenMetaHuman === 'object' &&
          lpTokenMetaHuman !== null &&
          'decimals' in lpTokenMetaHuman
            ? Number(lpTokenMetaHuman.decimals)
            : 18; // 기본값

        // 3. 계정의 LP 토큰 잔액 조회
        const balanceResponse = await api.query.assets.account(lpTokenId, accountAddress);
        const balanceData = balanceResponse.toJSON();

        // 4. 잔액 추출 및 계산
        const rawBalance = extractBalance(balanceData);

        // 5. 사람이 읽을 수 있는 형태로 변환
        const humanReadableBalance = Number(rawBalance) / Math.pow(10, lpTokenDecimals);

        // 6. LP 토큰 이름과 심볼 가져오기
        const lpTokenSymbol =
          lpTokenMetaHuman &&
          typeof lpTokenMetaHuman === 'object' &&
          'symbol' in lpTokenMetaHuman
            ? (lpTokenMetaHuman.symbol as string)
            : `LP-${baseAssetId}-${quoteAssetId}`;

        return {
          lpTokenId,
          rawBalance: rawBalance.toString(),
          humanReadableBalance,
          lpTokenSymbol,
          lpTokenDecimals,
          baseAssetId,
          quoteAssetId,
        };
      } catch (error) {
        console.error('[getLpTokenBalance] Error getting LP token balance:', error);
        throw new Error(`Failed to get LP token balance: ${error}`);
      }
    },
    [api, findLpTokenId],
  );

  /**
   * LP 토큰 쌍에 대한 풀 정보 조회 함수
   * @param baseAssetId 기본 토큰 ID
   * @param quoteAssetId 쿠팅 토큰 ID
   * @returns 풀 정보
   */
  const getPoolInfo = useCallback(
    async (baseAssetId: number, quoteAssetId: number): Promise<PoolInfo> => {
      if (!api) throw new Error('API not connected');

      try {
        const poolsData = await api.query.hybridOrderbook.pools.entries();

        for (const entry of poolsData as any[]) {
          const key = entry[0];
          const value = entry[1];
          const keyHuman = typeof key.toHuman === 'function' ? key.toHuman() : undefined;
          const valueHuman =
            typeof value.toHuman === 'function' ? value.toHuman() : undefined;
          console.log('[DEBUG][findLpTokenId] Pool keyHuman:', JSON.stringify(keyHuman));
          console.log('[DEBUG][findLpTokenId] Pool valueHuman:', valueHuman);
          const keyArr = Array.isArray(keyHuman[0]) ? keyHuman[0] : keyHuman;
          const poolBaseAssetId = extractId(keyArr[0]);
          const poolQuoteAssetId = extractId(keyArr[1]);
          console.log(
            '[DEBUG][findLpTokenId] Extracted asset IDs:',
            poolBaseAssetId,
            poolQuoteAssetId,
            'Target:',
            baseAssetId,
            quoteAssetId,
          );

          if (
            !Array.isArray(keyHuman) ||
            !valueHuman ||
            Object.keys(valueHuman).length === 0
          )
            continue;

          // 여기서는 바로 poolBaseAssetId, poolQuoteAssetId 사용

          if (
            (poolBaseAssetId === baseAssetId && poolQuoteAssetId === quoteAssetId) ||
            (poolBaseAssetId === quoteAssetId && poolQuoteAssetId === baseAssetId)
          ) {
            // 풀 정보 반환
            const reserve0 = valueHuman.reserve0 ? Number(valueHuman.reserve0) : 0;
            const reserve1 = valueHuman.reserve1 ? Number(valueHuman.reserve1) : 0;
            const lpTokenId = extractId(valueHuman.lpToken);
            const feeTier = valueHuman.feeTier ? Number(valueHuman.feeTier) : 0;

            return {
              baseAssetId: poolBaseAssetId,
              quoteAssetId: poolQuoteAssetId,
              reserve0,
              reserve1,
              lpTokenId,
              feeTier,
              poolExists: true,
              // 추가 필요한 풀 정보가 있으면 여기에 추가
            };
          }
        }

        return {
          baseAssetId,
          quoteAssetId,
          reserve0: 0,
          reserve1: 0,
          lpTokenId: 0,
          feeTier: 0,
          poolExists: false,
        };
      } catch (error) {
        console.error('[getPoolInfo] Error getting pool info:', error);
        throw new Error(`Failed to get pool info: ${error}`);
      }
    },
    [api],
  );

  /**
   * LP 토큰 출금/철회 함수
   * @param baseAssetId 기본 자산 ID
   * @param quoteAssetId 쿼트 자산 ID
   * @param lpAmount LP 토큰 출금량 (raw amount)
   * @param minBaseAmount 최소 기본 자산 반환량
   * @param minQuoteAmount 최소 쿼트 자산 반환량
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

        // extrinsic 실행
        return handleExtrinsic(
          extrinsic,
          { account: address, signer },
          {
            pending: 'Removing liquidity...',
            success: 'Liquidity removed successfully',
            error: 'Failed to remove liquidity',
          },
        );
      } catch (error) {
        console.error('[removeLiquidity] Error removing liquidity:', error);
        throw new Error(`Failed to remove liquidity: ${error}`);
      }
    },
    [api],
  );

  return {
    addLiquidity,
    createPool,
    getPoolPriceRatio,
    getLpTokenBalance,
    findLpTokenId,
    getPoolInfo,
    removeLiquidity,
  };
};
