import { Option } from '@polkadot/types-codec';
import { useEffect, useState } from 'react';

import { useApi } from './useApi';

export interface Token {
  id: number;
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
}

export function useTokens() {
  const { api, isConnected } = useApi();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      console.log('Starting token fetch...');
      console.log('API connected:', isConnected);
      console.log('API instance:', api ? 'exists' : 'null');

      if (!api || !isConnected) {
        console.log('API not ready, skipping fetch');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 먼저 모든 에셋 ID를 가져옵니다
        console.log('Fetching asset entries...');
        const assetEntries = await api.query.assets.asset.entries();
        console.log('Raw asset entries:', assetEntries);
        console.log('Total assets found:', assetEntries.length);

        const formattedTokens = await Promise.all(
          assetEntries.map(async ([key, value]) => {
            const assetId = (key.args[0] as any).toNumber();
            console.log(`Processing asset ID: ${assetId}`);

            const assetInfo = value as Option<any>;
            console.log(`Asset info for ${assetId}:`, assetInfo.toHuman());

            if (assetInfo.isSome) {
              const details = assetInfo.unwrap();
              const { status } = details.toHuman() as { status: string };
              console.log(`Asset ${assetId} status:`, status);

              // 활성화된 에셋에 대해서만 메타데이터 조회
              if (status === 'Live') {
                console.log(`Fetching metadata for asset ${assetId}...`);
                const metadata = await api.query.assets.metadata(assetId);
                const metadataHuman = metadata.toHuman() as {
                  symbol?: string;
                  name?: string;
                  decimals?: number;
                };
                console.log(`Metadata for asset ${assetId}:`, metadataHuman);

                // 메타데이터가 비어있지 않은 에셋만 반환
                if (metadataHuman.symbol && metadataHuman.name) {
                  return {
                    id: assetId,
                    symbol: metadataHuman.symbol || `Unknown #${assetId}`,
                    name: metadataHuman.name || `Unknown #${assetId}`,
                    decimals: metadataHuman.decimals || 12,
                    isActive: true,
                  };
                } else {
                  console.log(`Asset ${assetId} has empty metadata, using default values`);
                  return {
                    id: assetId,
                    symbol: `Unknown #${assetId}`,
                    name: `Unknown Asset #${assetId}`,
                    decimals: 12,
                    isActive: true,
                  };
                }
              } else {
                console.log(`Asset ${assetId} is not Live, skipping`);
              }
            } else {
              console.log(`Asset ${assetId} does not exist`);
            }

            return null;
          }),
        );

        // null 값 제거 및 활성화된 에셋만 필터링
        const activeTokens = formattedTokens
          .filter((token): token is Token => token !== null)
          .sort((a, b) => a.id - b.id);

        console.log('Final active tokens:', activeTokens);
        setTokens(activeTokens);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tokens'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [api, isConnected]);

  return { tokens, isLoading, error };
}
