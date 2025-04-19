'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { Reveal } from '@/components/Reveal';
import { albertSans, unbounded } from '@/styles/font';

export const HeroSection: React.FC = () => {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden relative px-5 flex flex-col items-center z-0">
      <Image
        src="/images/hero-overlay.svg"
        alt=""
        width={1150}
        height={838}
        className="w-[1150px] min-w-[1150px] h-[838px] min-h-[838px] absolute top-[-120px]"
      />
      <motion.div
        style={{ display: 'flex', zIndex: -1 }}
        initial={{ transform: `translate3d(0, -80px, 0)` }}
        animate={{ transform: `translate3d(0, -50px, 0)` }}
        transition={{
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'mirror',
          duration: 3,
        }}
      >
        <Image
          src="/images/warpx-hero.jpg"
          alt=""
          width={720}
          height={405}
          className="w-[550px] min-w-[550px] h-[500px] min-h-[500px] mb-[-140px]"
        />
      </motion.div>
      <Reveal>
        <h1
          className={`text-white text-center text-[42px] font-normal leading-[120%] tracking-[2px] uppercase ${unbounded.className} max-[700px]:text-[36px]`}
        >
          Swap with <br />
          Warping Speed
        </h1>
        <p
          className={`mt-5 text-[#a1a1aa] text-center text-[20px] font-normal leading-[130%] ${albertSans.className} max-[700px]:text-base max-[700px]:leading-[145%]`}
        >
          Settle <span className="inline-block">Lightning-Fast</span>{' '}
          <span className="inline-block">Onchain Trades</span>{' '}
          <span className="inline-block">with Top-Tier Prices.</span> <br />
          WarpX, the Cutting Edge Decentralized Exchange{' '}
          <span className="inline-block">and AppChain.</span>
        </p>

        <div className="mt-[48px] flex flex-col gap-[18px]">
          <p
            className={`text-white text-center text-lg font-normal ${unbounded.className} max-[700px]:text-base max-[700px]:leading-[145%]`}
          >
            Powered by
          </p>
          <div className="w-full flex items-center flex-wrap justify-center gap-[48px]">
            <Image
              src="/images/polkadot.svg"
              alt="Polkadot"
              width={218}
              height={47}
              className="object-contain mt-2"
              style={{ marginTop: 8 }}
            />
            <Image
              src="/images/tanssi.png"
              alt="Tanssi"
              width={152}
              height={47}
              className="object-contain"
            />
            <Image
              src="/images/w3f.png"
              alt="Web3 Foundation"
              width={119}
              height={47}
              className="object-contain"
            />
          </div>
        </div>
      </Reveal>
    </div>
  );
};
