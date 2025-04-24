'use client';

import { Keyring } from '@polkadot/keyring';
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

export const AssetsTab = () => {
  const { api, isConnected } = useApi();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const { showTxToast } = useTxToast();
  const { handleExtrinsic } = useExtrinsic();

  // 에셋 생성 폼 상태
  const [newAssetId, setNewAssetId] = useState('1');
  const [assetName, setAssetName] = useState('');
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetDecimals, setAssetDecimals] = useState('0');
  const [minBalance, setMinBalance] = useState('0');

  // 상태 추가
  const [step, setStep] = useState(1); // 1: 기본정보, 2: 팀 설정
  const [adminAccount, setAdminAccount] = useState('');
  const [issuerAccount, setIssuerAccount] = useState('');
  const [freezerAccount, setFreezerAccount] = useState('');

  useEffect(() => {
    if (api && isConnected) {
      setConnectionStatus('Connected to network');
    } else {
      setConnectionStatus('Not connected to network');
    }
  }, [api, isConnected]);

  useEffect(() => {
    console.log('API Debug:', {
      api: !!api,
      isConnected,
      hasUtility: !!api?.tx?.utility,
      hasAssets: !!api?.tx?.assets,
    });
  }, [api, isConnected]);

  useEffect(() => {
    const checkBalance = async () => {
      if (api && selectedAccount) {
        console.log('Selected account:', selectedAccount);
        try {
          if (selectedAccount === '//Alice') {
            // 개발 계정의 경우 특별 처리
            console.log('Development account selected, skipping balance check');
            return;
          }
          const { data: balance } = await api.query.system.account(selectedAccount);
          const free = api.createType('Balance', balance.free);
          console.log('Account balance:', free.toHuman());
        } catch (error) {
          console.error('Error checking balance:', error);
        }
      }
    };

    checkBalance();
  }, [api, selectedAccount]);

  useEffect(() => {
    if (api) {
      // assets 팔렛의 create 메서드 시그니처 확인
      console.log(
        'Assets create method:',
        api.tx.assets.create.meta.args.map((arg) => ({
          name: arg.name.toString(),
          type: arg.type.toString(),
        })),
      );
    }
  }, [api]);

  const handleCreateAsset = async () => {
    if (!api || !isConnected || !selectedAccount) {
      showTxToast('error', 'Please check network connection and account');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // 파라미터 타입 변환
      const assetId = api.createType('Compact<u32>', newAssetId);
      const minBalanceAmount = api.createType('u128', minBalance);

      const keyring = new Keyring({ type: 'sr25519' });
      let signerAccount;
      let adminAddress;

      // 개발 계정 또는 일반 계정 처리
      if (selectedAccount === '//Alice') {
        signerAccount = keyring.addFromUri('//Alice');
        adminAddress = signerAccount.address; // 실제 주소 사용

        await handleExtrinsic(
          api.tx.assets.create(assetId, adminAddress, minBalanceAmount),
          { useDev: true },
          {
            pending: 'Creating asset...',
            success: 'Asset created successfully',
            error: 'Failed to create asset',
          },
        );
      } else {
        const account = DEFAULT_ACCOUNTS.find((acc) => acc.address === selectedAccount);
        if (!account) throw new Error('Account not found');

        adminAddress = selectedAccount; // 선택된 계정 주소 사용

        await handleExtrinsic(
          api.tx.assets.create(assetId, adminAddress, minBalanceAmount),
          {
            account: selectedAccount,
            signer: account.mnemonic,
          },
          {
            pending: 'Creating asset...',
            success: 'Asset created successfully',
            error: 'Failed to create asset',
          },
        );
      }
    } catch (error) {
      console.error('Create asset error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create asset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-zinc-900">Create Asset</h4>
      <div className="bg-zinc-100/80 rounded-lg p-4 border border-zinc-200">
        <div className="space-y-4">
          <div className="text-sm text-zinc-600">{connectionStatus}</div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Creator Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an account</option>
              <option value="//Alice">Alice (Development Account)</option>
              {DEFAULT_ACCOUNTS.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.name} ({account.address.slice(0, 16)}...)
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
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
                  className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter asset name"
                  className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Asset Symbol
                </label>
                <input
                  type="text"
                  value={assetSymbol}
                  onChange={(e) => setAssetSymbol(e.target.value)}
                  placeholder="Enter asset symbol"
                  className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Decimals
                </label>
                <input
                  type="number"
                  value={assetDecimals}
                  onChange={(e) => setAssetDecimals(e.target.value)}
                  placeholder="Enter decimals"
                  min="0"
                  max="20"
                  className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
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
                  className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                onClick={handleCreateAsset}
                disabled={!assetName || !assetSymbol || isLoading || !isConnected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
