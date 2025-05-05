'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
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
