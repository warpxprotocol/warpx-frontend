'use client';

import Link from 'next/link';

export default function Navigation() {
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
    </nav>
  );
}
