import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { useEffect, useState } from 'react';

export const usePolkadotConnect = (wsUrl: string) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connect = async () => {
      setIsConnecting(true);
      setError(null);

      try {
        const provider = new WsProvider(wsUrl);
        const api = await ApiPromise.create({ provider });
        setApi(api);

        const extensions = await web3Enable('polkadot-js');
        if (extensions.length === 0) {
          throw new Error('Polkadot.js extension not found');
        }

        const extensionSigner = extensions[0].signer;
        setSigner(extensionSigner);
        api.setSigner(extensionSigner);

        const allAccounts = await web3Accounts();
        setAccounts(allAccounts);

        if (allAccounts.length > 0) {
          setSelectedAccount(allAccounts[0].address);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
      } finally {
        setIsConnecting(false);
      }
    };

    connect();

    return () => {
      if (api) api.disconnect();
    };
  }, [wsUrl]);

  return {
    api,
    accounts,
    selectedAccount,
    signer,
    isConnecting,
    error,
    setSelectedAccount,
  };
};
