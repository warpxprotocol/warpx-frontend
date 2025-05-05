'use client';

import { useEffect, useState } from 'react';

export default function WalletConnector() {
  const [mounted, setMounted] = useState(false);

  const { connected, selectedAccount, balance, connect, disconnect } =
    require('@/app/features/wallet/hooks/useWalletStore').useWalletStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {connected ? (
        <>
          <span className="text-sm bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700 text-gray-300">
            {selectedAccount?.slice(0, 6)}...{selectedAccount?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-sm px-3 py-1.5 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-all duration-200"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => connect()}
          className="text-sm px-3 py-1.5 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-all duration-200"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
