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
      <div
        style={{
          width: '140px',
          height: '40px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <img
          src="/images/logo.png"
          alt="WarpX Logo"
          style={{
            width: '120%',
            height: '120%',
            objectFit: 'cover',
            objectPosition: 'center',
            marginLeft: '-10%',
            marginRight: '-10%',
            display: 'block',
          }}
        />
      </div>
    </Link>
  );
}
