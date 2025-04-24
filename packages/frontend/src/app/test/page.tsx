'use client';

import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { DexModal } from '@/components/DexModal';
import { useApi } from '@/hooks/useApi';
import {
  fetchRecentBlocks,
  subscribeToAssetTransfers,
} from '@/services/features/assets/quries';

interface NetworkEvent {
  type: string;
  data: {
    from?: string;
    to?: string;
    amount?: string;
    section?: string;
    method?: string;
    number?: number;
    hash?: string;
    assetId?: string;
    [key: string]: any; // 추가 필드를 위한 인덱스 시그니처
  };
  timestamp: number;
}

interface TestAccount {
  address: string;
  name: string;
  balance: string;
  assets: Array<{
    id: string;
    balance: string;
  }>;
}

export default function TestPage() {
  const { api, isConnected } = useApi();
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [isDexModalOpen, setIsDexModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'mint' | 'liquidity'>('accounts');
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 최근 블록 정보 조회
  const { data: recentBlocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ['recentBlocks'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      console.log('Fetching recent blocks...');
      const blocks = await fetchRecentBlocks(api);
      console.log('Fetched blocks:', blocks);
      return blocks;
    },
    enabled: !!api && isConnected,
    refetchInterval: 10000,
  });

  // 네트워크 이벤트 구독
  useEffect(() => {
    if (!api || !isConnected) {
      console.log('API or connection not ready:', { api: !!api, isConnected });
      return;
    }

    console.log('Setting up event subscriptions...');

    // 에셋 전송 이벤트 구독
    const unsubscribeTransfer = subscribeToAssetTransfers(
      api as ApiPromise,
      (from, to, amount) => {
        console.log('Asset transfer event:', { from, to, amount });
        setEvents((prev) =>
          [
            {
              type: 'AssetTransfer',
              data: { from, to, amount },
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 20),
        );
      },
    );

    // 시스템 이벤트 구독
    const unsubscribeSystem = api.query.system.events((events: EventRecord[]) => {
      console.log('System events received:', events.length);
      events.forEach((record: EventRecord) => {
        const { event } = record;
        console.log('Event:', event.section, event.method);
        const humanData = event.data.toHuman();
        setEvents((prev) =>
          [
            {
              type: `${event.section}.${event.method}`,
              data: {
                section: event.section,
                method: event.method,
                ...(typeof humanData === 'object' ? humanData : {}),
              },
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 20),
        );
      });
    }) as unknown as Promise<() => void>;

    // 새로운 블록 헤더 구독
    const unsubscribeNewHeads = api.rpc.chain.subscribeNewHeads((header) => {
      console.log('New block header:', header.number.toNumber());
      setEvents((prev) =>
        [
          {
            type: 'NewBlock',
            data: {
              number: header.number.toNumber(),
              hash: header.hash.toString(),
            },
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 20),
      );
    });

    return () => {
      console.log('Cleaning up subscriptions...');
      unsubscribeTransfer.then((unsub) => unsub());
      unsubscribeSystem.then((unsub) => unsub());
      unsubscribeNewHeads.then((unsub) => unsub());
    };
  }, [api, isConnected]);

  useEffect(() => {
    const checkBalance = async () => {
      if (api && selectedAccount) {
        const { data: balance } = await api.query.system.account(selectedAccount);
        const free = api.createType('Balance', balance.free);
        console.log('Account balance:', {
          free: free.toHuman(),
          hex: balance.free.toString(),
          raw: balance.toString(),
        });
      }
    };

    checkBalance();
  }, [api, selectedAccount]);

  const handleOpenDexModal = () => {
    console.log('Opening DEX modal...');
    setIsDexModalOpen(true);
  };

  const handleCloseDexModal = () => {
    console.log('Closing DEX modal...');
    setIsDexModalOpen(false);
  };

  if (!isConnected) {
    return (
      <div className="p-4 min-h-screen bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-400">Network Test Dashboard</h1>
            <button
              onClick={handleOpenDexModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled
            >
              Open DEX Tester
            </button>
          </div>
          <div className="bg-red-900/50 p-4 rounded-lg border border-red-500">
            <p className="text-red-300">Network not connected</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingBlocks) {
    return (
      <div className="p-4 min-h-screen bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-400">Network Test Dashboard</h1>
            <button
              onClick={handleOpenDexModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled
            >
              Open DEX Tester
            </button>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Network Test Dashboard</h1>
          <button
            onClick={() => setIsDexModalOpen(true)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Open DEX Tester
          </button>
        </div>

        {/* 연결 상태 */}
        <div className="mb-6 p-3 bg-[#111] rounded-lg border border-gray-800">
          <p className="text-green-400 font-medium">Network Status: Connected</p>
        </div>

        {/* 최근 블록 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Blocks</h2>
          <div className="bg-[#111] rounded-lg border border-gray-800">
            {recentBlocks?.map((block) => (
              <div
                key={block.hash}
                className="flex items-center justify-between p-3 border-b border-gray-800 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-24 font-mono text-gray-400">#{block.number}</div>
                  <div className="text-gray-500 font-mono text-sm">
                    {block.hash.slice(0, 16)}...
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-gray-400 text-sm">
                    <span className="text-gray-500">Extrinsics:</span>{' '}
                    {block.extrinsicsCount}
                  </div>
                  <div className="text-gray-500 text-sm w-24 text-right">
                    {new Date(block.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 네트워크 이벤트 */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Network Events</h2>
          <div className="bg-[#111] rounded-lg border border-gray-800">
            {events.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">No events available</div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="border-b border-gray-800 last:border-b-0">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-300">{event.type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <pre className="text-sm bg-black/50 p-3 rounded overflow-x-auto text-gray-400 font-mono">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {mounted && (
          <DexModal isOpen={isDexModalOpen} onClose={() => setIsDexModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
