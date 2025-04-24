import { Inter } from 'next/font/google';

import { TxToastProvider } from '@/components/toast/TxToastProvider';

import '../styles/globals.css';
import ClientLayout from './ClientLayout';

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
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#09090B' }}>
        <TxToastProvider>
          <ClientLayout>{children}</ClientLayout>
        </TxToastProvider>
      </body>
    </html>
  );
}
