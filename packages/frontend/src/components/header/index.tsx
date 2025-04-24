'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const WalletConnector = () => {
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
};

// 동적으로 불러오고 SSR을 비활성화
const DynamicWalletConnector = dynamic(() => Promise.resolve(WalletConnector), {
  ssr: false,
});

// 메인 헤더 컴포넌트 - 기본 UI는 서버에서 렌더링하고, 지갑 연결 부분만 클라이언트에서 렌더링
export default function Header() {
  return (
    <header className="w-full bg-[#09090B]/90 backdrop-blur-md border-b border-gray-800 py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <Link href="/" className="flex items-center">
        <motion.div
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            WarpX
          </span>
        </motion.div>
      </Link>

      <nav className="flex gap-6">
        <Link
          href="/wallet"
          className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
        >
          Wallet
        </Link>
        <Link
          href="/trading"
          className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
        >
          Trading
        </Link>
      </nav>

      <DynamicWalletConnector />
    </header>
  );
}
