'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Logo() {
  const pathname = usePathname();
  const isPoolPair = /^\/pools\/[^/]+$/.test(pathname);
  const logoHref = isPoolPair ? '/pools' : '/';

  return (
    <Link href={logoHref} className="flex items-center">
      <span className="text-2xl font-bold font-MyFont text-white opacity-80">warp(x)</span>
    </Link>
  );
}
