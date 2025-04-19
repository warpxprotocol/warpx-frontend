'use client';

import Image from 'next/image';

import { Reveal } from '@/components/Reveal';
import { albertSans, unbounded } from '@/styles/font';

export const SwapSection: React.FC = () => {
  return (
    <div className="w-full px-5 flex">
      <div
        className="mx-auto mb-[200px] max-w-[800px] w-full flex justify-between items-center
                     lg:max-w-[740px]
                     md:max-w-none md:flex-col-reverse md:gap-12"
      >
        <div className="flex flex-col gap-4 md:items-center md:text-center">
          <h2
            className={`text-white text-right text-[32px] font-normal leading-normal ${unbounded.className}
                          sm:text-[24px]
                          md:text-center`}
          >
            Instant Trades <br />
            with the AMM
          </h2>
          <p
            className={`text-[#a1a1aa] text-right text-[20px] font-normal leading-normal ${albertSans.className}
                         sm:text-base
                         md:text-center`}
          >
            Liquidity always present
          </p>
        </div>

        <div
          className="w-[414px] min-w-[414px] flex flex-col gap-3
                      md:w-full md:max-w-[400px] md:min-w-0
                      sm:max-w-[290px]"
        >
          <Reveal>
            <Image
              src="/images/swap-1.png"
              alt=""
              width={414}
              height={84}
              className="w-full h-[84px] md:h-auto"
            />
            <Image
              src="/images/swap-2.png"
              alt=""
              width={414}
              height={84}
              className="w-full h-[84px] md:h-auto"
            />
            <span
              className={`mt-1 w-full h-[56px] flex justify-center items-center rounded-lg bg-white
                            text-black text-center text-[20px] font-medium leading-[100%] tracking-[-0.4px] ${unbounded.className}
                            md:text-base
                            xs:h-12`}
            >
              Swap
            </span>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
