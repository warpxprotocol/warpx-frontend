'use client';

import Image from 'next/image';

import { Reveal } from '@/components/Reveal';
import { unbounded } from '@/styles/font';

export const HybridSection: React.FC = () => {
  return (
    <div className="my-[170px] pl-0 pr-5 w-full flex justify-center items-center z-0 md:flex-col md:gap-5 md:px-0">
      <div
        className="w-[696px] h-[529px] relative z-0 transition-all duration-200 ease-in-out 
                    lg:scale-[0.85] lg:-my-4 lg:-mr-5
                    sm:scale-[0.6] sm:-my-[100px]"
      >
        <Reveal>
          <Image
            src="/images/model-stack-1.png"
            alt=""
            width={696}
            height={529}
            className="w-[696px] min-w-[696px] h-[529px] min-h-[529px] z-[1]"
          />
        </Reveal>
        <Reveal delay={200} className="flex z-[2] absolute top-[92px] left-0">
          <Image
            src="/images/model-stack-2.png"
            alt=""
            width={565}
            height={347}
            className="w-[565px] min-w-[565px] h-[347px] min-h-[347px]"
          />
        </Reveal>
        <Reveal delay={400} className="flex z-[3] absolute top-[95px] right-[48px]">
          <Image
            src="/images/model-stack-3.png"
            alt=""
            width={227}
            height={60}
            className="w-[227px] min-w-[227px] h-[60px] min-h-[60px] filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.54)]"
          />
        </Reveal>
      </div>
      <Reveal delay={600}>
        <h2
          className={`text-white text-right text-[32px] font-normal leading-normal ${unbounded.className}
                       md:text-center sm:text-[24px]`}
        >
          Hybrid Exchange <br />
          Using Both AMM <br />& Orderbook
        </h2>
      </Reveal>
    </div>
  );
};
