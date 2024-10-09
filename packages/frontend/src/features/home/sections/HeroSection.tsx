import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Image from 'next/image';

import warpxHeroIllust from '@/assets/warpx-hero.jpg';
import { albertSans, unbounded } from '@/styles/font';

export const HeroSection: React.FC = () => {
  return (
    <Container>
      <motion.div
        style={{ display: 'flex', zIndex: -1 }}
        initial={{ transform: `translate3d(0, -40px, 0)` }}
        animate={{ transform: `translate3d(0, 0px, 0)` }}
        transition={{
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
          duration: 2,
        }}
      >
        <Illust src={warpxHeroIllust} alt="" width={720} height={405} />
      </motion.div>
      <Title>
        Swap with <br />
        Warping Speed
      </Title>
      <Description>
        A Simple and Secure AMM <br />& Orderbook-based Hybrid Exchange
      </Description>

      <PoweredByContainer>
        <PoweredByText>Powered by</PoweredByText>
        <PoweredByLogo src="/assets/polkadot.svg" alt="Polkadot" width={218} height={47} />
      </PoweredByContainer>
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
const Illust = styled(Image)`
  width: 454px;
  height: 440px;
`;

const Title = styled.h1`
  margin-top: -72px;

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
const PoweredByLogo = styled(Image)`
  width: 218px;
  height: 47px;
  object-fit: contain;
`;
