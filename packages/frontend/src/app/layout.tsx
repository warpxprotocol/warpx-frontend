import { Inter } from 'next/font/google';

import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#09090B',
};

export const metadata = {
  title: 'WarpX - Swap with warping speed',
  description:
    'A Simple and Secure AMM & Orderbook-based Hybrid Exchange. Settle Lightning-Fast Onchain Trades with Top-Tier Prices.',
  openGraph: {
    title: 'WarpX - Swap with warping speed',
    description:
      'A Simple and Secure AMM & Orderbook-based Hybrid Exchange. Settle Lightning-Fast Onchain Trades with Top-Tier Prices.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WarpX - Swap with warping speed',
    description:
      'A Simple and Secure AMM & Orderbook-based Hybrid Exchange. Settle Lightning-Fast Onchain Trades with Top-Tier Prices.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#09090B] text-white scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
