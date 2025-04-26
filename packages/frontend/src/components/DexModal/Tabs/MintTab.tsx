'use client';

import { Keyring } from '@polkadot/keyring';
import { useEffect, useState } from 'react';

import { DEFAULT_ACCOUNTS, TestAccount } from '@/constants/accounts';
import { useApi } from '@/hooks/useApi';

interface Asset {
  id: string;
  owner: string;
  admin: string;
  minBalance: string;
  status: string;
}

export const MintTab = () => {
  const { api, isConnected } = useApi();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [accountBalance, setAccountBalance] = useState('0');
  const [accountReserved, setAccountReserved] = useState('0');
  const [accountAssets, setAccountAssets] = useState<Asset[]>([]);

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
      return;
    }

    try {
      // 계정 잔액 조회
      const accountInfo = await api.query.system.account(selectedAccount);
      setAccountBalance(accountInfo.data.free.toString());
      setAccountReserved(accountInfo.data.reserved.toString());

      console.log('Fetching assets for account:', selectedAccount);

      // 계정의 에셋 목록 조회
      const assetMetadatas = await api.query.assets.metadata.entries();
      console.log('Total asset metadatas found:', assetMetadatas.length);

      const assets: Asset[] = [];

      for (const [key, metadata] of assetMetadatas) {
        const assetId = key.args[0].toString();
        console.log('Checking asset:', assetId);

        const assetInfo = await api.query.assets.asset(assetId);
        console.log('Asset info:', assetInfo.toHuman());

        if (assetInfo.isSome) {
          const details = assetInfo.unwrap();
          console.log('Asset details:', details.toHuman());
          const { owner, admin, minBalance } = details;

          // 해당 계정이 admin인 에셋만 필터링
          if (admin.toString() === selectedAccount) {
            console.log('Found matching asset:', assetId);
            assets.push({
              id: assetId,
              owner: owner.toString(),
              admin: admin.toString(),
              minBalance: minBalance.toString(),
              status: details.status.toString(),
            });
          }
        }
      }

      console.log('Final assets list:', assets);
      setAccountAssets(assets);
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

      const account = DEFAULT_ACCOUNTS.find((acc) => acc.address === selectedAccount);
      if (!account) throw new Error('Account not found');

      const keyring = new Keyring({ type: 'sr25519' });
      const pair = keyring.addFromMnemonic(account.mnemonic);

      // Mint 토큰
      console.log('Minting tokens...');
      const mintTx = api.tx.assets.mint(selectedAsset, selectedAccount, amount);

      await new Promise<void>((resolve, reject) => {
        mintTx
          .signAndSend(pair, { nonce: -1 }, ({ status, events = [] }) => {
            console.log('Transaction status:', status.type);

            if (status.isInBlock) {
              console.log('Included at block hash', status.asInBlock.toHex());
              events.forEach(({ event: { data, method, section } }) => {
                console.log('Event:', section, method, data.toString());
              });
              resolve();
            }
          })
          .catch(reject);
      });

      console.log('Tokens minted successfully');
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
              {DEFAULT_ACCOUNTS.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.name} ({account.address.slice(0, 16)}...)
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="space-y-1">
              <div className="text-sm text-gray-400">
                Free Balance: {Number(accountBalance) / 1000000000000} WAR
              </div>
              <div className="text-sm text-gray-400">
                Reserved: {Number(accountReserved) / 1000000000000} WAR
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
                      Asset #{asset.id}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAsset && (
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
