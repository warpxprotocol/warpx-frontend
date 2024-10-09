import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Image from 'next/image';

import warpxHeroIllust from '@/assets/warpx-hero.jpg';
import { Reveal } from '@/components/Reveal';
import { albertSans, unbounded } from '@/styles/font';

export const HeroSection: React.FC = () => {
  return (
    <Container>
      <HeroOverlay src="/assets/hero-overlay.svg" alt="" width={1150} height={838} />
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
        <Illust src={warpxHeroIllust} alt="" width={720} height={405} />
      </motion.div>
      <Reveal>
        <Title>
          Swap with <br />
          Warping Speed
        </Title>
        <Description>
          A Simple and Secure Hybrid Exchange <br />
          Using both AMM and Orderbook
        </Description>

        <PoweredByContainer>
          <PoweredByText>Powered by</PoweredByText>
          <PoweredByLogoList>
            <PoweredByLogo
              src="/assets/polkadot.svg"
              alt="Polkadot"
              width={218}
              height={47}
              style={{ marginTop: 8 }}
            />
            <PoweredByLogo src="/assets/tanssi.png" alt="Tanssi" width={152} height={47} />
            <PoweredByLogo
              src="/assets/w3f.png"
              alt="Web3 Foundation"
              width={119}
              height={47}
            />
          </PoweredByLogoList>
        </PoweredByContainer>
      </Reveal>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 0;
`;
const HeroOverlay = styled(Image)`
  width: 1150px;
  min-width: 1150px;
  height: 838px;
  min-height: 838px;
  position: absolute;
  top: -120px;
`;
const Illust = styled(Image)`
  width: 550px;
  height: 500px;
  margin-bottom: -140px;
`;
const Title = styled.h1`
  color: #fff;
  text-align: center;
  font-family: ${unbounded.style.fontFamily};
  font-size: 42px;
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 2px;
  text-transform: uppercase;
`;
const Description = styled.p`
  margin-top: 20px;

  color: #a1a1aa;
  text-align: center;
  font-family: ${albertSans.style.fontFamily};
  font-size: 20px;
  font-weight: 400;
  line-height: 130%;
`;

const PoweredByContainer = styled.div`
  margin-top: 48px;

  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const PoweredByText = styled.p`
  color: #fff;
  text-align: center;
  font-family: ${unbounded.style.fontFamily};
  font-size: 18px;
  font-weight: 400;
`;
const PoweredByLogoList = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 48px;
`;
const PoweredByLogo = styled(Image)`
  object-fit: contain;
`;
