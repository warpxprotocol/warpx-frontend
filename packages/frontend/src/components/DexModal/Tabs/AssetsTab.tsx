'use client';

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';

import { useTxToast } from '@/components/toast/useTxToast';
import { DEFAULT_ACCOUNTS } from '@/constants/accounts';
import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';

interface Asset {
  id: string;
  owner: string;
  admin: string;
  minBalance: string;
  status: string;
  metadata?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

interface Web3Account extends InjectedAccountWithMeta {
  signer?: any;
}

export const AssetsTab = () => {
  const { api, isConnected } = useApi();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const { showTxToast } = useTxToast();
  const { handleExtrinsic } = useExtrinsic();
  const [availableWeb3Accounts, setAvailableWeb3Accounts] = useState<Web3Account[]>([]);
  const [selectedWeb3Account, setSelectedWeb3Account] = useState('');

  // 에셋 생성 폼 상태
  const [newAssetId, setNewAssetId] = useState('1');
  const [assetName, setAssetName] = useState('');
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetDecimals, setAssetDecimals] = useState('0');
  const [minBalance, setMinBalance] = useState('0');

  // 현재 단계 관리
  const [currentStep, setCurrentStep] = useState<'create' | 'setAdmin'>('create');
  const [createdAssetId, setCreatedAssetId] = useState('');

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
          setSelectedWeb3Account(accountsWithSigners[0].address);
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

  const handleCreateAsset = async () => {
    if (!api || !isConnected || !selectedWeb3Account) {
      showTxToast('error', 'Please check network connection and select a web3 account');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const selectedAccount = availableWeb3Accounts.find(
        (account) => account.address === selectedWeb3Account,
      );

      if (!selectedAccount) {
        throw new Error('Selected account not found');
      }

      if (!selectedAccount.signer) {
        throw new Error('No signer available for the selected account');
      }

      // Create all three transactions
      const createAssetTx = api.tx.assets.create(
        newAssetId,
        selectedWeb3Account,
        minBalance,
      );

      const setTeamTx = api.tx.assets.setTeam(
        newAssetId,
        selectedWeb3Account, // issuer
        selectedWeb3Account, // admin
        selectedWeb3Account, // freezer
      );

      const setMetadataTx = api.tx.assets.setMetadata(
        newAssetId,
        assetName,
        assetSymbol,
        parseInt(assetDecimals),
      );

      // Combine all transactions into a single batchAll transaction
      const batchAllTx = api.tx.utility.batchAll([createAssetTx, setTeamTx, setMetadataTx]);

      console.log('[AssetsTab] Sending batch transaction with operations:', {
        assetId: newAssetId,
        name: assetName,
        symbol: assetSymbol,
        decimals: assetDecimals,
        minBalance: minBalance,
        account: selectedWeb3Account,
      });

      // Execute the batched transaction
      await handleExtrinsic(
        batchAllTx,
        {
          signer: selectedAccount.signer,
          account: selectedWeb3Account,
        },
        {
          pending: 'Creating asset with metadata...',
          success: 'Asset created successfully with metadata',
          error: 'Failed to complete asset creation process',
        },
      );

      // Reset form after successful creation
      setNewAssetId('1');
      setAssetName('');
      setAssetSymbol('');
      setAssetDecimals('0');
      setMinBalance('0');
    } catch (error) {
      console.error('Create asset error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create asset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-white">Asset Management</h4>
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="space-y-4">
          <div className="text-sm text-gray-400">{connectionStatus}</div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Web3 Account
            </label>
            <select
              value={selectedWeb3Account}
              onChange={(e) => setSelectedWeb3Account(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="">Select a web3 account</option>
              {availableWeb3Accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.meta.name || 'Unnamed Account'} ({account.address.slice(0, 16)}
                  ...)
                </option>
              ))}
            </select>
          </div>

          {selectedWeb3Account && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Asset ID
                </label>
                <input
                  type="number"
                  value={newAssetId}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setNewAssetId(value.toString());
                  }}
                  min="0"
                  placeholder="Enter asset ID"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter asset name"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Asset Symbol
                </label>
                <input
                  type="text"
                  value={assetSymbol}
                  onChange={(e) => setAssetSymbol(e.target.value)}
                  placeholder="Enter asset symbol"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Decimals
                </label>
                <input
                  type="number"
                  value={assetDecimals}
                  onChange={(e) => setAssetDecimals(e.target.value)}
                  placeholder="Enter decimals"
                  min="0"
                  max="20"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Minimum Balance
                </label>
                <input
                  type="number"
                  value={minBalance}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setMinBalance(value.toString());
                  }}
                  min="0"
                  placeholder="Enter minimum balance"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                onClick={handleCreateAsset}
                disabled={isLoading || !isConnected}
                className="w-full px-4 py-2 bg-blue-900/50 text-blue-400 rounded-lg hover:bg-blue-900/70 transition-colors border border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Asset'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
