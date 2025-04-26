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
        <span className="flex items-center gap-1.5 text-sm text-gray-400 bg-[#1A1A1D] px-3 py-1.5 rounded-md border border-gray-800">
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
          <span className="text-sm bg-[#1A1A1D] px-3 py-1.5 rounded-md border border-gray-800 text-green-400">
            {selectedAccount?.slice(0, 6)}...{selectedAccount?.slice(-4)}
            {balance && <span className="ml-1 opacity-80">({balance})</span>}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-sm px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:shadow-md hover:shadow-red-900/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          <span className="flex items-center gap-1.5 text-sm text-gray-400 bg-[#1A1A1D] px-3 py-1.5 rounded-md border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
            Not connected
          </span>
          <button
            onClick={() => connect()}
            className="text-sm px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:shadow-md hover:shadow-purple-900/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            Connect Wallet
          </button>
        </>
      )}
    </div>
  );
}
