'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Logo() {
  return (
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
  );
}
