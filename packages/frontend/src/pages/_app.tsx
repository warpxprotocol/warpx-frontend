import { AppProps } from 'next/app';
import React from 'react';

import { MetaHead } from '@/components/MetaHead';

const meta = {
  title: 'WarpX - Swap with warping speed',
  description: 'A Simple and Secure AMM & Orderbook-based Hybrid Exchange',
  // image: 'https://warpx.space/og-image.jpg',
  // url: 'https://warpx.space',
  // canonical: 'https://warpx.space',
  themeColor: '#09090B',
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <MetaHead {...meta} />
      <Component {...pageProps} />

      <style jsx global>{`
        html,
        body {
          scroll-behavior: smooth;
        }

        html {
          background-color: #09090b;
          color: white;
        }

        ::selection {
          background-color: rgba(255, 255, 255, 0.85);
          color: rgba(0, 0, 0, 0.75);
        }
      `}</style>
    </React.Fragment>
  );
}

export default MyApp;
