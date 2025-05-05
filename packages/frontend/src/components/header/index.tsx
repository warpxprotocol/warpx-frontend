'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import LaunchAppButton from './LaunchAppButton';
import Logo from './Logo';
import Navigation from './Navigation';

// 동적으로 불러오고 SSR을 비활성화
const DynamicWalletConnector = dynamic(() => import('./WalletConnector'), {
  ssr: false,
});

const DynamicDexModal = dynamic<{ isOpen: boolean; onClose: () => void }>(
  () => import('../DexModal').then((mod) => mod.DexModal),
  {
    ssr: false,
  },
);

// 메인 헤더 컴포넌트 - 기본 UI는 서버에서 렌더링하고, 지갑 연결 부분만 클라이언트에서 렌더링
export default function Header() {
  const [isDexModalOpen, setIsDexModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="w-full bg-[#09090B]/90 backdrop-blur-md border-b border-gray-800 py-2 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <Logo />
        {/* <Navigation onDexClick={() => setIsDexModalOpen(true)} /> */}
        {pathname === '/' ? <LaunchAppButton /> : <DynamicWalletConnector />}
      </header>
      {/* <DynamicDexModal isOpen={isDexModalOpen} onClose={() => setIsDexModalOpen(false)} /> */}
    </>
  );
}
