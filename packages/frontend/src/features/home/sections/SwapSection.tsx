import styled from '@emotion/styled';
import Image from 'next/image';

import swap1 from '@/assets/swap-1.png';
import swap2 from '@/assets/swap-2.png';
import { Reveal } from '@/components/Reveal';
import { albertSans, unbounded } from '@/styles/font';

export const SwapSection: React.FC = () => {
  return (
    <Wrapper>
      <Container>
        <Info>
          <Title>
            Instant Trades <br />
            with the AMM
          </Title>
          <Description>Liquidity always present</Description>
        </Info>

        <SwapColList>
          <Reveal>
            <SwapColImage src={swap1} alt="" />
            <SwapColImage src={swap2} alt="" />
            <SwapButton>Swap</SwapButton>
          </Reveal>
        </SwapColList>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
`;
const Container = styled.div`
  margin: 0 auto 200px;
  max-width: 800px;
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  @media screen and (max-width: 1070px) {
    max-width: 740px;
  }

  @media screen and (max-width: 840px) {
    max-width: unset;
    flex-direction: column-reverse;
    gap: 48px;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media screen and (max-width: 840px) {
    align-items: center;

    * {
      text-align: center;
    }
  }
`;
const Title = styled.h2`
  color: #fff;
  text-align: right;
  font-family: ${unbounded.style.fontFamily};
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  @media screen and (max-width: 600px) {
    font-size: 24px;
  }
`;
const Description = styled.p`
  color: #a1a1aa;
  text-align: right;
  font-family: ${albertSans.style.fontFamily};
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  @media screen and (max-width: 600px) {
    font-size: 16px;
  }
`;

const SwapColList = styled.div`
  width: 414px;
  min-width: 414px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media screen and (max-width: 840px) {
    width: 100%;
    max-width: 400px;
    min-width: unset;
  }

  @media screen and (max-width: 460px) {
    max-width: 290px;
  }
`;
const SwapColImage = styled(Image)`
  width: 100%;
  height: 84px;

  @media screen and (max-width: 840px) {
    height: auto;
  }
`;
const SwapButton = styled.span`
  margin-top: 4px;
  width: 100%;
  height: 56px;

  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: #fff;

  color: #000;
  text-align: center;
  font-family: ${unbounded.style.fontFamily};
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 20px */
  letter-spacing: -0.4px;

  @media screen and (max-width: 840px) {
    font-size: 16px;
  }

  @media screen and (max-width: 400px) {
    height: 48px;
  }
`;
