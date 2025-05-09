'use client';

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';

import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';

interface Web3Account extends InjectedAccountWithMeta {
  signer?: any;
}

interface Asset {
  id: string;
  owner: string;
  admin: string;
  minBalance: string;
  status: string;
  supply: string;
  metadata?: {
    name: string;
    symbol: string;
    decimals: string | number;
  };
}

export const MintTab = () => {
  const { api, isConnected } = useApi();
  const { handleExtrinsic } = useExtrinsic();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [accountBalance, setAccountBalance] = useState('0');
  const [accountReserved, setAccountReserved] = useState('0');
  const [accountAssets, setAccountAssets] = useState<Asset[]>([]);
  const [assetBalances, setAssetBalances] = useState<Record<string, string>>({});
  const [availableWeb3Accounts, setAvailableWeb3Accounts] = useState<Web3Account[]>([]);

  useEffect(() => {
    const loadWeb3Accounts = async () => {
      try {
        const extensions = await web3Enable('polkadex');
        if (extensions.length === 0) {
          throw new Error('No web3 extension found');
        }

        const allAccounts = await web3Accounts();
        console.log('Loaded web3 accounts:', allAccounts);

        // Verify each account has a signer
        const accountsWithSigners = allAccounts.map((account) => {
          const accountWithSigner: Web3Account = {
            ...account,
            signer: extensions[0].signer,
          };
          if (!accountWithSigner.signer) {
            console.warn(`Account ${account.address} has no signer`);
          }
          return accountWithSigner;
        });

        setAvailableWeb3Accounts(accountsWithSigners);
        if (accountsWithSigners.length > 0) {
          setSelectedAccount(accountsWithSigners[0].address);
        }
      } catch (error) {
        console.error('Error loading web3 accounts:', error);
        setError('Failed to load web3 accounts');
      }
    };

    loadWeb3Accounts();
  }, []);

  useEffect(() => {
    if (api && isConnected) {
      setConnectionStatus('Connected to network');
    } else {
      setConnectionStatus('Not connected to network');
    }
  }, [api, isConnected]);

  const fetchAccountInfo = async () => {
    if (!api || !isConnected || !selectedAccount) {
      setAccountAssets([]);
      setAssetBalances({});
      return;
    }

    console.log('[MintTab] fetchAccountInfo: selectedAccount =', selectedAccount);

    try {
      // 계정 정보와 에셋 메타데이터를 병렬로 조회
      const [accountInfo, assetMetadatas] = await Promise.all([
        api.query.system.account(selectedAccount),
        api.query.assets.metadata.entries(),
      ]);

      // 계정 잔액 처리
      const accountInfoHuman = accountInfo.toHuman() as {
        data: {
          free: string | { toString: () => string };
          reserved: string | { toString: () => string };
        };
      };

      const freeBalance =
        typeof accountInfoHuman.data.free === 'string'
          ? accountInfoHuman.data.free
          : accountInfoHuman.data.free.toString();
      const reservedBalance =
        typeof accountInfoHuman.data.reserved === 'string'
          ? accountInfoHuman.data.reserved
          : accountInfoHuman.data.reserved.toString();

      setAccountBalance(freeBalance);
      setAccountReserved(reservedBalance);

      console.log('[MintTab] Free balance:', freeBalance, 'Reserved:', reservedBalance);
      console.log('[MintTab] Fetching assets for account:', selectedAccount);
      console.log('[MintTab] Total asset metadatas found:', assetMetadatas.length);

      // 에셋 기본 정보 수집 - 모든 에셋 정보를 한 번에 조회
      const assetIds = assetMetadatas.map(([key]) => key.args[0].toString());

      // 모든 에셋 정보를 병렬로 조회
      const assetInfoQueries = assetIds.map((assetId) => api.query.assets.asset(assetId));
      const assetInfos = await Promise.all(assetInfoQueries);

      // 관련 에셋만 필터링
      const relevantAssets = [];
      for (let i = 0; i < assetIds.length; i++) {
        const assetId = assetIds[i];
        const assetInfo = assetInfos[i];
        const assetInfoHuman = assetInfo.toHuman() as {
          owner: string;
          issuer: string;
          admin: string;
          freezer: string;
          supply: string;
          deposit: string;
          minBalance: string;
          isSufficient: boolean;
          accounts: number;
          sufficients: number;
          approvals: number;
          status: string;
        } | null;

        if (assetInfoHuman && assetInfoHuman.admin === selectedAccount) {
          relevantAssets.push({
            id: assetId,
            info: assetInfoHuman,
            metadata: assetMetadatas.find(
              ([key]) => key.args[0].toString() === assetId,
            )?.[1],
          });
        }
      }

      // 관련 에셋의 메타데이터와 잔액 조회를 병렬로 실행
      const assets: Asset[] = [];
      const balances: Record<string, string> = {};

      if (relevantAssets.length > 0) {
        const assetQueries = relevantAssets.map((asset) => {
          const assetId = asset.id;
          return Promise.all([
            api.query.assets.metadata(assetId),
            api.query.assets.account(assetId, selectedAccount),
          ]).then(([metadata, balance]) => {
            const metadataHuman = metadata.toHuman() as {
              name?: string;
              symbol?: string;
              decimals?: string | number;
            } | null;

            const balanceJson = balance.toJSON();
            function extractBalance(json: any): string {
              if (
                json &&
                typeof json === 'object' &&
                'balance' in json &&
                typeof json.balance === 'string'
              ) {
                return json.balance;
              }
              return '0';
            }

            const actualBalance = extractBalance(balanceJson);
            balances[assetId] = actualBalance;

            console.log(
              '[MintTab] Asset',
              assetId,
              'admin:',
              asset.info.admin,
              'selectedAccount:',
              selectedAccount,
              'balance:',
              actualBalance,
            );

            return {
              id: assetId,
              owner: asset.info.owner,
              admin: asset.info.admin,
              minBalance: asset.info.minBalance,
              status: asset.info.status,
              supply: asset.info.supply,
              metadata: metadataHuman
                ? {
                    name: metadataHuman.name || `Asset #${assetId}`,
                    symbol: metadataHuman.symbol || `ASSET${assetId}`,
                    decimals: metadataHuman.decimals || 12,
                  }
                : {
                    name: `Asset #${assetId}`,
                    symbol: `ASSET${assetId}`,
                    decimals: 12,
                  },
            };
          });
        });

        const processedAssets = await Promise.all(assetQueries);
        assets.push(...processedAssets);
      }

      console.log('Final assets list:', assets);
      setAccountAssets(assets);
      setAssetBalances(balances);
      console.log('[MintTab] setAccountAssets:', assets);
      console.log('[MintTab] setAssetBalances:', balances);
      console.log(
        '[MintTab] After fetch: selectedAccount =',
        selectedAccount,
        ', selectedAsset =',
        selectedAsset,
        ', assetBalances =',
        balances,
      );
    } catch (error) {
      console.error('Failed to fetch account info:', error);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [api, isConnected, selectedAccount]);

  const handleMint = async () => {
    if (!api || !isConnected || !selectedAccount || !selectedAsset || !amount) return;

    console.log(
      '[MintTab] handleMint: recipient =',
      selectedAccount,
      ', asset =',
      selectedAsset,
      ', amount =',
      amount,
    );

    try {
      setIsLoading(true);
      setError('');

      const selectedWeb3Account = availableWeb3Accounts.find(
        (account) => account.address === selectedAccount,
      );

      if (!selectedWeb3Account) {
        throw new Error('Selected account not found');
      }

      if (!selectedWeb3Account.signer) {
        throw new Error('No signer available for the selected account');
      }

      // [수정] decimals 가져오기
      const asset = accountAssets.find((a) => a.id === selectedAsset);
      const decimals = asset?.metadata?.decimals
        ? parseInt(asset.metadata.decimals.toString())
        : 12;
      // [수정] amount에 decimals 곱하기
      const mintAmount = BigInt(Math.floor(Number(amount) * 10 ** decimals)).toString();

      console.log('[MintTab] Minting tokens...', {
        mintAmount,
        decimals,
        amount,
        selectedAccount,
        selectedAsset,
      });
      console.log(
        '[MintTab] Minting: assetId =',
        selectedAsset,
        'recipient =',
        selectedAccount,
        'amount =',
        mintAmount,
      );

      // Create the mint transaction
      const mintTx = api.tx.assets.mint(selectedAsset, selectedAccount, mintAmount);

      try {
        console.log('[MintTab] Sending mint transaction with params:', {
          assetId: selectedAsset,
          recipient: selectedAccount,
          amount: mintAmount,
          decimals: decimals,
          originalAmount: amount,
        });

        // 방법 1: 단일 트랜잭션으로 처리 (batchAll 없이)
        await handleExtrinsic(
          mintTx,
          {
            signer: selectedWeb3Account.signer,
            account: selectedAccount,
          },
          {
            pending: 'Minting tokens...',
            success: 'Tokens minted successfully',
            error: 'Failed to mint tokens',
          },
        );

        /* 방법 2: utility.batch 사용 (utility.batchAll 대신) - 필요시 주석 해제
        const batchTx = api.tx.utility.batch([mintTx]);
        await handleExtrinsic(
          batchTx,
          {
            signer: selectedWeb3Account.signer,
            account: selectedAccount,
          },
          {
            pending: 'Processing batch transaction...',
            success: 'Batch transaction completed successfully',
            error: 'Failed to process batch transaction',
          },
        );
        */

        // 트랜잭션 완료 후 잔고 fetch
        console.log('[MintTab] Transaction finalized, refreshing balances...');
        await fetchAccountInfo();
        setAmount('');
      } catch (txError) {
        // 오류 세부 정보 출력
        console.error('Transaction error details:', txError);

        // API 오류 응답 구조 분석
        if (txError && typeof txError === 'object') {
          // 자세한 오류 내용 출력
          console.error('Error structure:', JSON.stringify(txError, null, 2));

          // 특정 오류 필드 확인
          if ('message' in txError)
            console.error('Error message:', (txError as any).message);
          if ('data' in txError) console.error('Error data:', (txError as any).data);
          if ('type' in txError) console.error('Error type:', (txError as any).type);
          if ('code' in txError) console.error('Error code:', (txError as any).code);
        }

        setError(
          txError instanceof Error ? txError.message : 'Failed to process transaction',
        );
        throw txError; // 상위 catch 블록으로 오류 전달
      }
    } catch (error) {
      console.error('Failed to process transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to process transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: print liquidity modal token IDs (for debugging assetId match)
  const printLiquidityTokenIds = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win: any = window;
    if (win && win.getLiquidityModalTokenIds) {
      const ids = win.getLiquidityModalTokenIds();
      alert(
        `Liquidity Modal token0.id: ${ids.token0}, token1.id: ${ids.token1}\nMintTab selectedAsset: ${selectedAsset}`,
      );
      console.log(
        'Liquidity Modal token0.id:',
        ids.token0,
        'token1.id:',
        ids.token1,
        'MintTab selectedAsset:',
        selectedAsset,
      );
    } else {
      alert('getLiquidityModalTokenIds helper not found on window.');
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-white">Token Minting</h4>
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="space-y-4">
          <div className="text-sm text-gray-400">{connectionStatus}</div>
          {/* Helper button for debugging assetId match */}
          <button
            className="mb-2 px-2 py-1 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900/70 border border-blue-800 text-xs"
            onClick={printLiquidityTokenIds}
            type="button"
          >
            Show Liquidity Modal Token IDs
          </button>
          <div className="text-xs text-gray-500">
            MintTab selectedAsset: <b>{selectedAsset}</b>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="">Select an account</option>
              {availableWeb3Accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.meta.name || 'Unnamed Account'} ({account.address.slice(0, 16)}
                  ...)
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="space-y-1">
              <div className="text-sm text-gray-400">
                Free Balance:{' '}
                {accountBalance
                  ? (Number(accountBalance.replace(/,/g, '')) / 1000000000000).toFixed(4)
                  : '0'}{' '}
                WARP
              </div>
              <div className="text-sm text-gray-400">
                Reserved:{' '}
                {accountReserved
                  ? (Number(accountReserved.replace(/,/g, '')) / 1000000000000).toFixed(4)
                  : '0'}{' '}
                WARP
              </div>
            </div>
          )}

          {accountAssets.length > 0 && (
            <div className="space-y-4 border-t border-gray-700 pt-4 mt-4">
              <h5 className="text-md font-medium text-gray-300">Mint Asset</h5>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Asset
                </label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="">Select an asset</option>
                  {accountAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.metadata?.name} ({asset.metadata?.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAsset && (
                <>
                  <div className="text-sm text-gray-400">
                    Total Supply:{' '}
                    {(() => {
                      const asset = accountAssets.find((a) => a.id === selectedAsset);
                      const decimals = asset?.metadata?.decimals
                        ? parseInt(asset.metadata.decimals.toString())
                        : 12;
                      const rawSupply = asset?.supply || '0';

                      console.log('Supply calculation:', {
                        asset,
                        decimals,
                        rawSupply,
                        supplyWithoutCommas: rawSupply.replace(/,/g, ''),
                      });

                      try {
                        const supplyValue = BigInt(rawSupply.replace(/,/g, ''));
                        const divisor = BigInt(10 ** decimals);

                        // 나눗셈 결과를 문자열로 처리
                        const result = (
                          Number(supplyValue) / Math.pow(10, decimals)
                        ).toString();

                        return Number(result).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: decimals,
                        });
                      } catch (err) {
                        console.error('Error calculating supply:', err);
                        return '0';
                      }
                    })()}
                  </div>
                  <div className="text-sm text-gray-400">
                    Account Balance:{' '}
                    {(() => {
                      const asset = accountAssets.find((a) => a.id === selectedAsset);
                      const decimals = asset?.metadata?.decimals
                        ? parseInt(asset.metadata.decimals.toString())
                        : 12;
                      // 실제 내 계정의 잔고만 표시 (assetBalances는 반드시 api.query.assets.account(assetId, selectedAccount) 결과)
                      let rawBalance = '0';
                      if (asset && selectedAccount) {
                        // assetBalances가 실제 내 계정의 잔고만 저장하도록 보장
                        rawBalance = assetBalances[asset.id] || '0';
                      }
                      try {
                        const balanceValue = BigInt(rawBalance.replace(/,/g, ''));
                        const result = (
                          Number(balanceValue) / Math.pow(10, decimals)
                        ).toString();
                        return Number(result).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: decimals,
                        });
                      } catch (err) {
                        console.error('Error calculating balance:', err);
                        return '0';
                      }
                    })()}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    />
                  </div>
                </>
              )}

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                onClick={handleMint}
                disabled={
                  !selectedAccount || !selectedAsset || !amount || isLoading || !isConnected
                }
                className="w-full px-4 py-2 bg-blue-900/50 text-blue-400 rounded-lg hover:bg-blue-900/70 transition-colors border border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Minting...' : 'Mint Token'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
