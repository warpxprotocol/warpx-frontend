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

      console.log('Fetching assets for account:', selectedAccount);

      // 계정의 에셋 목록 조회
      const assetMetadatas = await api.query.assets.metadata.entries();
      console.log('Total asset metadatas found:', assetMetadatas.length);

      const assets: Asset[] = [];
      const balances: Record<string, string> = {};

      for (const [key, metadata] of assetMetadatas) {
        const assetId = key.args[0].toString();
        console.log('Checking asset:', assetId);

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

        if (assetInfoHuman) {
          const { owner, admin, minBalance, supply } = assetInfoHuman;

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
            const balance = await api.query.assets.account(assetId, selectedAccount);
            const balanceHuman = balance.toHuman() as {
              balance: string;
            } | null;

            if (balanceHuman) {
              balances[assetId] = balanceHuman.balance;
            }

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
    } catch (error) {
      console.error('Failed to fetch account info:', error);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [api, isConnected, selectedAccount]);

  const handleMint = async () => {
    if (!api || !isConnected || !selectedAccount || !selectedAsset || !amount) return;

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

      // Mint 토큰
      console.log('Minting tokens...');
      const mintTx = api.tx.assets.mint(selectedAsset, selectedAccount, amount);

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

      // 에셋 목록 새로고침
      fetchAccountInfo();

      // 폼 초기화
      setAmount('');
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to mint tokens');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-white">Token Minting</h4>
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="space-y-4">
          <div className="text-sm text-gray-400">{connectionStatus}</div>

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
                      const rawBalance = assetBalances[selectedAsset] || '0';

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
