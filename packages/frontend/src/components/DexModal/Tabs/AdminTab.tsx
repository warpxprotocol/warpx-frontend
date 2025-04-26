import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { useState } from 'react';

import { useApi } from '../../../hooks/useApi';
import { useTxToast } from '../../toast/useTxToast';

export const AdminTab = () => {
  const { api, isLoading, error: apiError, isConnected } = useApi();
  const { showTxToast } = useTxToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('10000');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  const connectWallet = async () => {
    try {
      // Enable Polkadot.js extension
      const extensions = await web3Enable('polkadot-js');
      if (extensions.length === 0) {
        throw new Error('Polkadot.js extension not found');
      }

      // Get the signer from the extension
      const extensionSigner = extensions[0].signer;
      setSigner(extensionSigner);

      // Set the signer for the API
      if (api) {
        api.setSigner(extensionSigner);
      }

      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);

      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0].address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(
        'Failed to connect wallet. Please make sure Polkadot.js extension is installed.',
      );
    }
  };

  const handleTransfer = async () => {
    if (!api || !selectedAccount || !signer) {
      console.log('API not available, no account selected, or no signer');
      showTxToast(
        'error',
        'Please connect to API, select an account, and ensure signer is available',
      );
      return;
    }

    setIsTransferring(true);
    setTransferStatus('Preparing transfer...');

    try {
      console.log('Creating keyring...');
      const keyring = new Keyring({ type: 'sr25519' });

      // Use Alice account as sender
      const alice = keyring.addFromUri('//Alice');
      console.log('Alice address:', alice.address);

      // Convert amount to planks (1 token = 1e12 planks)
      const planks = (BigInt(amount) * BigInt(1_000_000_000_000)).toString();
      console.log('Transfer amount in planks:', planks);

      setTransferStatus('Sending transaction...');

      // Create and send the transaction
      const tx = api.tx.balances.transferKeepAlive(selectedAccount, planks);

      // Use Alice account to sign and send the transaction
      const result = await tx.signAndSend(alice, ({ status, events = [] }) => {
        if (status.isInBlock) {
          console.log('Transaction included in block:', status.asInBlock.toHex());
          setTransferStatus('Transaction in block...');
          showTxToast('pending', 'Transfer in progress - Transaction included in block');
        } else if (status.isFinalized) {
          console.log('Transaction finalized in block:', status.asFinalized.toHex());
          setTransferStatus('Transaction finalized!');
          showTxToast('success', 'Transfer completed successfully');
          setIsTransferring(false);
        } else if (status.isReady) {
          setTransferStatus('Transaction ready...');
          showTxToast('pending', 'Transfer initiated - Waiting for block inclusion');
        }
      });

      console.log('Initial transaction result:', result.toString());
      showTxToast('pending', 'Transfer initiated - Waiting for confirmation');
    } catch (err) {
      console.error('Transfer error:', err);
      setTransferStatus(
        `Transfer failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      showTxToast('error', 'Transfer failed');
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isConnected && (
        <div className="text-center text-sm text-gray-400">
          {isLoading ? 'Connecting to WarpX chain...' : 'Failed to connect to WarpX chain'}
        </div>
      )}

      {apiError && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg">
          {apiError.message}
        </div>
      )}

      {isConnected && !signer && (
        <button
          onClick={connectWallet}
          className="w-full py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          Connect Wallet
        </button>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {isConnected && signer && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Amount (tokens)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              min="0"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={isTransferring || !selectedAccount}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              isTransferring || !selectedAccount
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
            }`}
          >
            {isTransferring ? 'Transferring...' : 'Transfer'}
          </button>

          {transferStatus && (
            <div className="text-center text-sm text-gray-400">{transferStatus}</div>
          )}
        </div>
      )}
    </div>
  );
};
