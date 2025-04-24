import '@polkadot/api-augment';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import type { Option } from '@polkadot/types';
import '@polkadot/types/lookup';
import type { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import { formatBalance } from '@polkadot/util';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { DEFAULT_ACCOUNTS } from '@/constants/accounts';
import { useApi } from '@/hooks/useApi';

interface TestAccount {
  address: string;
  name: string;
  balance: string;
  reservedBalance: string;
  assets: Array<{
    id: string;
    balance: string;
  }>;
  mnemonic: string;
}

export const AccountsTab = () => {
  const { api, isConnected } = useApi();
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>(
    DEFAULT_ACCOUNTS.map((account) => ({
      ...account,
      reservedBalance: '0',
    })),
  );
  const [newAccountName, setNewAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 계정 목록 조회
  const { data: accounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['testAccounts'],
    queryFn: async () => {
      if (!api || !isConnected) throw new Error('API not connected');
      return testAccounts;
    },
    enabled: !!api && isConnected,
  });

  // 계정 잔액 조회
  const fetchAccountBalance = async (address: string) => {
    if (!api || !isConnected) return { free: '0', reserved: '0' };

    try {
      const accountInfo = await api.query.system.account<FrameSystemAccountInfo>(address);
      return {
        free: formatBalance(accountInfo.data.free.toString(), { withUnit: 'WAR' }),
        reserved: formatBalance(accountInfo.data.reserved.toString(), { withUnit: 'WAR' }),
      };
    } catch (error) {
      console.error('Failed to fetch account balance:', error);
      return { free: '0', reserved: '0' };
    }
  };

  // 계정 자산 조회
  const fetchAccountAssets = async (address: string) => {
    if (!api || !isConnected) return [];

    try {
      // 모든 자산 ID 조회
      const assetIds = await api.query.assets.asset.entries();

      // 각 자산의 잔액 조회
      const assets = await Promise.all(
        assetIds.map(async ([key]) => {
          const assetId = key.args[0].toString();
          const assetAccount = (await api.query.assets.account(
            assetId,
            address,
          )) as Option<any>;

          if (assetAccount.isSome) {
            const balance = assetAccount.unwrap().balance.toString();
            return {
              id: assetId,
              balance: formatBalance(balance, { withUnit: 'WAR' }),
            };
          }
          return null;
        }),
      );

      return assets.filter((asset): asset is NonNullable<typeof asset> => asset !== null);
    } catch (error) {
      console.error('Failed to fetch account assets:', error);
      return [];
    }
  };

  // 계정 정보 업데이트
  const updateAccountInfo = async (account: TestAccount) => {
    try {
      const [balances, assets] = await Promise.all([
        fetchAccountBalance(account.address),
        fetchAccountAssets(account.address),
      ]);

      return {
        ...account,
        balance: balances.free,
        reservedBalance: balances.reserved,
        assets,
      };
    } catch (error) {
      console.error('Failed to update account info:', error);
      return account;
    }
  };

  // 계정 목록 새로고침
  const refreshAccounts = async () => {
    if (!api || !isConnected) return;

    setIsLoading(true);
    try {
      const updatedAccounts = await Promise.all(testAccounts.map(updateAccountInfo));
      setTestAccounts(updatedAccounts);
    } catch (error) {
      console.error('Failed to refresh accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (api && isConnected) {
      refreshAccounts();
    }
  }, [api, isConnected]);

  const handleCreateAccount = async () => {
    if (!api || !isConnected) return;

    try {
      setIsLoading(true);
      // 새로운 니모닉 생성
      const mnemonic = mnemonicGenerate();
      const keyring = new Keyring({ type: 'sr25519' });
      const pair = keyring.addFromMnemonic(mnemonic);

      // 계정 정보 생성
      const newAccount: TestAccount = {
        address: pair.address,
        name: newAccountName || `Account ${testAccounts.length + 1}`,
        balance: '0',
        reservedBalance: '0',
        assets: [],
        mnemonic, // 니모닉 저장
      };

      // Alice 계정에서 새 계정으로 잔액 전송
      const aliceKeyring = new Keyring({ type: 'sr25519' });
      const alice = aliceKeyring.addFromMnemonic(DEFAULT_ACCOUNTS[0].mnemonic);

      const transferTx = api.tx.balances.transfer(
        pair.address,
        1000000000000, // 1 WAR 전송
      );

      // 트랜잭션 실행
      await new Promise<void>((resolve, reject) => {
        transferTx
          .signAndSend(
            alice, // Alice 계정으로 서명
            ({ status }) => {
              if (status.isInBlock) {
                console.log('Transfer in block');
                resolve();
              }
            },
          )
          .catch(reject);
      });

      setTestAccounts((prev) => [...prev, newAccount]);
      setNewAccountName('');

      // 계정 목록 새로고침
      await refetchAccounts();
      await refreshAccounts();

      console.log('Account created:', newAccount);
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-zinc-900">Test Accounts</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Account name"
            className="px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleCreateAccount}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-zinc-500">Loading account information...</p>
        </div>
      )}

      <div className="space-y-2">
        {testAccounts.map((account) => (
          <div
            key={account.address}
            className="bg-zinc-100/80 rounded-lg p-4 border border-zinc-200 hover:border-zinc-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-zinc-900">{account.name}</p>
                <p className="text-sm text-zinc-500 font-mono">
                  {account.address.slice(0, 16)}...
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-zinc-600">Free Balance: {account.balance}</p>
                <p className="text-sm text-zinc-600">Reserved: {account.reservedBalance}</p>
              </div>
            </div>
            {account.assets.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-200">
                <p className="text-sm text-zinc-500 mb-1">Assets:</p>
                <div className="space-y-1">
                  {account.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex justify-between text-sm bg-zinc-50 p-2 rounded border border-zinc-200"
                    >
                      <span className="text-zinc-600">#{asset.id}</span>
                      <span className="text-zinc-900">{asset.balance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
