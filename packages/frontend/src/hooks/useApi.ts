import { ApiPromise, WsProvider } from '@polkadot/api';
import { useEffect, useState } from 'react';

const WS_URL = 'ws://127.0.0.1:9988'; // WarpX 파라체인 노드 (charlie)

export function isApiReady(
  api: ApiPromise | null,
  isConnected: boolean,
  isReady: boolean,
): boolean {
  return api !== null && isConnected && isReady;
}

export function useApi() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let currentApi: ApiPromise | null = null;

    const initApi = async () => {
      try {
        const provider = new WsProvider(WS_URL);
        currentApi = await ApiPromise.create({
          provider,
          types: {
            Address: 'AccountId',
            LookupSource: 'AccountId',
            Balance: 'u128',
            BlockNumber: 'u32',
            Hash: 'H256',
            Weight: 'u64',
          },
          rpc: {
            chain: {
              getBlockHash: {
                description: 'Get block hash by number',
                params: [
                  {
                    name: 'blockNumber',
                    type: 'BlockNumber',
                    isOptional: true,
                  },
                ],
                type: 'Hash',
              },
              getHeader: {
                description: 'Get header of a relay chain block',
                params: [
                  {
                    name: 'hash',
                    type: 'Hash',
                    isOptional: true,
                  },
                ],
                type: 'Header',
              },
              subscribeNewHeads: {
                description: 'Subscribe to new headers',
                params: [],
                type: 'Header',
                pubsub: ['newHead', 'subscribeNewHeads', 'unsubscribeNewHeads'],
              },
            },
            state: {
              getRuntimeVersion: {
                description: 'Get runtime version',
                params: [
                  {
                    name: 'hash',
                    type: 'Hash',
                    isOptional: true,
                  },
                ],
                type: 'RuntimeVersion',
              },
            },
            system: {
              chain: {
                description: 'Get chain name',
                params: [],
                type: 'Text',
              },
              properties: {
                description: 'Get system properties',
                params: [],
                type: 'ChainProperties',
              },
            },
          },
        });

        // API가 준비될 때까지 기다림
        await currentApi.isReady;
        console.log('API is ready');
        setIsReady(true);

        // 연결 상태 로깅 및 상태 업데이트
        provider.on('connected', () => {
          console.log('WS Connected');
          setIsConnected(true);
        });
        provider.on('disconnected', () => {
          console.log('WS Disconnected');
          setIsConnected(false);
          setIsReady(false);
        });
        provider.on('error', (error) => {
          console.error('WS Error:', error);
          setIsConnected(false);
          setIsReady(false);
        });

        // 초기 연결 상태 확인
        if (provider.isConnected) {
          setIsConnected(true);
        }

        setApi(currentApi);
        setIsLoading(false);
      } catch (err) {
        console.error('API initialization error:', err);
        setError(err as Error);
        setIsLoading(false);
        setIsConnected(false);
        setIsReady(false);
      }
    };

    initApi();

    return () => {
      if (currentApi) {
        currentApi.disconnect();
      }
    };
  }, []);

  return { api, isLoading, error, isConnected, isReady };
}
