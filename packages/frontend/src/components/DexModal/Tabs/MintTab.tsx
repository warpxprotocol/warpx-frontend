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
      // 계정 잔액 조회
      const accountInfo = await api.query.system.account(selectedAccount);
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

      // 계정의 에셋 목록 조회
      const assetMetadatas = await api.query.assets.metadata.entries();
      console.log('[MintTab] Total asset metadatas found:', assetMetadatas.length);

      const assets: Asset[] = [];
      const balances: Record<string, string> = {};

      for (const [key, metadata] of assetMetadatas) {
        const assetId = key.args[0].toString();
        console.log('Checking asset:', assetId);

        console.log('[MintTab] typeof assetId:', typeof assetId, 'assetId:', assetId);
        const assetInfo = await api.query.assets.asset(assetId);
        console.log('Asset info:', assetInfo.toHuman());

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

        console.log('[MintTab] Asset', assetId, 'full info:', assetInfoHuman);

        if (assetInfoHuman) {
          const { owner, admin, minBalance, supply, status } = assetInfoHuman;

          console.log('[MintTab] Asset', assetId, 'admin:', admin, 'selectedAccount:', selectedAccount, 'status:', status);

          // 해당 계정이 admin인 에셋만 필터링
          if (admin === selectedAccount) {
            console.log('Found matching asset:', assetId);

            // 에셋 메타데이터 조회
            const metadata = await api.query.assets.metadata(assetId);
            const metadataHuman = metadata.toHuman() as {
              name?: string;
              symbol?: string;
              decimals?: string | number;
            } | null;

            // 에셋 잔액 조회
            console.log('[MintTab] typeof selectedAccount:', typeof selectedAccount, 'selectedAccount:', selectedAccount);
            const balance = await api.query.assets.account(assetId, selectedAccount);
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
            console.log('[MintTab] Asset', assetId, 'balance for', selectedAccount, '=', actualBalance);
            balances[assetId] = actualBalance;

            assets.push({
              id: assetId,
              owner,
              admin,
              minBalance,
              status: assetInfoHuman.status,
              supply: assetInfoHuman.supply,
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
            });
          }
        }
      }

      console.log('Final assets list:', assets);
      setAccountAssets(assets);
      setAssetBalances(balances);
      console.log('[MintTab] setAccountAssets:', assets);
      console.log('[MintTab] setAssetBalances:', balances);
      console.log('[MintTab] After fetch: selectedAccount =', selectedAccount, ', selectedAsset =', selectedAsset, ', assetBalances =', balances);
    } catch (error) {
      console.error('Failed to fetch account info:', error);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [api, isConnected, selectedAccount]);

  const handleMint = async () => {
    if (!api || !isConnected || !selectedAccount || !selectedAsset || !amount) return;

    console.log('[MintTab] handleMint: recipient =', selectedAccount, ', asset =', selectedAsset, ', amount =', amount);

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
      // Mint 토큰
      console.log('[MintTab] Minting tokens...', { mintAmount, decimals, amount, selectedAccount, selectedAsset });
      console.log('[MintTab] Minting: assetId =', selectedAsset, 'recipient =', selectedAccount, 'amount =', mintAmount);
    const mintTx = api.tx.assets.mint(selectedAsset, selectedAccount, mintAmount);

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
        }
      );
      // 트랜잭션 완료 후 잔고 fetch
      console.log('[MintTab] Mint extrinsic finalized, refreshing balances...');
      await fetchAccountInfo();
      setAmount('');
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to mint tokens');
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
      alert(`Liquidity Modal token0.id: ${ids.token0}, token1.id: ${ids.token1}\nMintTab selectedAsset: ${selectedAsset}`);
      console.log('Liquidity Modal token0.id:', ids.token0, 'token1.id:', ids.token1, 'MintTab selectedAsset:', selectedAsset);
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
