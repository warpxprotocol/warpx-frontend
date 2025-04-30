import { Signer } from '@polkadot/api/types';

// TypeScript global patch for injectedWeb3/walletExtension
// (You may move this to a separate global.d.ts file for better maintainability)
declare global {
  interface Window {
    injectedWeb3?: Record<string, any>;
    walletExtension?: any;
  }
}

export const extractId = (x: any): number => {
  console.log('extractId input:', x, 'type:', typeof x);

  if (x === undefined || x === null) return NaN;

  if (typeof x === 'object' && x !== null) {
    if ('WithId' in x) return Number(x.WithId);
    if ('withId' in x) return Number(x.withId);
  }

  // 숫자나 문자열로 변환 시도
  const num = Number(x);
  if (!isNaN(num)) return num;

  console.warn('Failed to extract ID from:', x);
  return NaN;
};

// 자산 메타데이터에서 소수점 추출 함수
export function extractDecimals(metaHuman: any): number {
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
export function extractBalance(balanceData: any): bigint {
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
export async function getAccountSigner(
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
