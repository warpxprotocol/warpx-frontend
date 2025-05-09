'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/Reveal';
import { albertSans, unbounded } from '@/styles/font';

export const SwapSection: React.FC = () => {
  return (
    <div className="w-full px-5">
      <div
        className="mx-auto mb-[200px] w-full flex justify-between items-center gap-12 flex-nowrap
                   sm:flex-col-reverse"
      >
        <div className="flex flex-col gap-4 items-start text-left sm:items-center sm:text-center">
          <h2
            className={`text-white text-[32px] font-normal leading-normal ${unbounded.className}
                        sm:text-[24px]`}
          >
            Instant Trades <br />
            with the AMM
          </h2>
          <p
            className={`text-[#a1a1aa] text-[20px] font-normal leading-normal ${albertSans.className}
                        sm:text-base`}
          >
            Liquidity always present
          </p>
        </div>

        <div
          className="w-[414px] min-w-[414px] flex flex-col gap-3
                      sm:w-full sm:max-w-[400px] sm:min-w-0
                      xs:max-w-[290px]"
        >
          <Reveal>
            <Image
              src="/images/swap-1.png"
              alt=""
              width={414}
              height={84}
              className="w-full h-[84px] sm:h-auto"
            />
            <Image
              src="/images/swap-2.png"
              alt=""
              width={414}
              height={84}
              className="w-full h-[84px] sm:h-auto"
            />
            <span
              className={`mt-1 w-full h-[56px] flex justify-center items-center rounded-lg bg-white
                            text-black text-center text-[20px] font-medium leading-[100%] tracking-[-0.4px] ${unbounded.className}
                            sm:text-base
                            xs:h-12`}
            >
              <Link href="/pools/DOT%2FUSDT?baseId=1&quoteId=2">Swap</Link>
            </span>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
