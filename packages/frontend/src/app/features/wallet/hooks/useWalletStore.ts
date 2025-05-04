'use client';

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { AccountInfo } from '@polkadot/types/interfaces';
import { useEffect } from 'react';
import { create } from 'zustand';

import { NetworkType, disconnectApi, getPolkadotApi } from '@/services/config/polkadot';

// 환경 변수에서 기본 네트워크 설정 읽기
const DEFAULT_NETWORK: NetworkType =
  (typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_POLKADOT_NETWORK as NetworkType)) ||
  'warpx';

interface WalletState {
  connected: boolean;
  accounts: { address: string }[];
  selectedAccount?: string;
  balance?: string;
  network: NetworkType;
  connect: (network?: NetworkType) => Promise<void>;
  disconnect: () => Promise<void>;
  changeNetwork: (network: NetworkType) => Promise<void>;
  isConnecting: boolean;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  connected: false,
  accounts: [],
  network: DEFAULT_NETWORK,
  isConnecting: false,
  connect: async (network = DEFAULT_NETWORK) => {
    if (typeof window === 'undefined') return;

    try {
      set({ isConnecting: true });

      const extensions = await web3Enable('My DApp');
      if (extensions.length === 0) {
        console.error('폴카닷 익스텐션이 설치되지 않았거나 접근이 허용되지 않았습니다.');
        set({ isConnecting: false });
        return;
      }

      const accounts = await web3Accounts();
      if (accounts.length === 0) {
        console.error('계정이 없습니다. 폴카닷 익스텐션에서 계정을 생성하세요.');
        set({ isConnecting: false });
        return;
      }

      const selected = accounts[0];
      const api = await getPolkadotApi(network);

      // 체인 정보 가져오기
      const chainInfo = await api.registry.getChainProperties();
      const chainName = chainInfo?.tokenSymbol.toString() || 'Unknown';
      const chainDecimals = chainInfo?.tokenDecimals.toString() || 'Unknown';

      // 최신 블록 번호 가져오기
      const latestBlock = await api.rpc.chain.getHeader();
      const blockNumber = latestBlock.number.toNumber();
      const accountInfo = (await api.query.system.account(selected.address)) as AccountInfo;

      const balance = accountInfo.data.free.toHuman();

      set({
        connected: true,
        accounts,
        selectedAccount: selected.address,
        balance,
        network,
        isConnecting: false,
      });
      localStorage.setItem('connected', 'true');

      console.log(`${network} 네트워크에 연결됨: ${selected.address}`);
    } catch (error) {
      console.error('지갑 연결 중 오류 발생:', error);
      set({ isConnecting: false });
    }
  },
  disconnect: async () => {
    try {
      const { network } = get();
      await disconnectApi(network);
      set({
        connected: false,
        accounts: [],
        selectedAccount: undefined,
        balance: undefined,
      });
      localStorage.removeItem('connected');
    } catch (error) {
      console.error('연결 해제 중 오류 발생:', error);
    }
  },
  changeNetwork: async (network: NetworkType) => {
    const { connected } = get();

    // 연결된 상태라면 먼저 연결 해제
    if (connected) {
      await get().disconnect();
    }

    // 새 네트워크로 연결
    await get().connect(network);
  },
}));

// Hook to initialize wallet connection on mount
export const useInitializeWallet = () => {
  const { connect, connected } = useWalletStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && !connected) {
      const isConnected = localStorage.getItem('connected') === 'true';
      if (isConnected) {
        connect();
      }
    }
  }, [connect, connected]);
};
