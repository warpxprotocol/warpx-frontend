'use client';

import Link from 'next/link';

interface NavigationProps {
  onDexClick: () => void;
}

export default function Navigation({ onDexClick }: NavigationProps) {
  return (
    <nav className="flex gap-6">
      <Link
        href="/pools"
        className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
      >
        Pools
      </Link>
      <Link
        href="/test"
        className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
      >
        Test
      </Link>
      <button
        onClick={onDexClick}
        className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
      >
        DEX
      </button>
    </nav>
  );
}
