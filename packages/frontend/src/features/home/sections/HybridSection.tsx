import styled from '@emotion/styled';
import Image from 'next/image';

import stack1 from '@/assets/model-stack-1.png';
import stack2 from '@/assets/model-stack-2.png';
import stack3 from '@/assets/model-stack-3.png';
import { Reveal } from '@/components/Reveal';
import { unbounded } from '@/styles/font';

export const HybridSection: React.FC = () => {
  return (
    <Container>
      <IllustContainer>
        <Reveal>
          <Stack1 src={stack1} alt="" />
        </Reveal>
        <RevealStack2 delay={200}>
          <Stack2 src={stack2} alt="" />
        </RevealStack2>
        <RevealStack3 delay={200 * 2}>
          <Stack3 src={stack3} alt="" />
        </RevealStack3>
      </IllustContainer>
      <Reveal delay={200 * 3}>
        <Title>
          Hybrid Exchange <br />
          Using Both AMM <br />& Orderbook
        </Title>
      </Reveal>
    </Container>
  );
};

const Container = styled.div`
  margin: 170px 0;
  padding: 0 20px;
  padding-left: 0;

  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
`;
const IllustContainer = styled.div`
  width: 696px;
  height: 529px;
  position: relative;
  z-index: 0;
`;
const Stack1 = styled(Image)`
  width: 696px;
  min-width: 696px;
  height: 529px;
  min-height: 529px;
  z-index: 1;
`;
const RevealStack2 = styled(Reveal)`
  display: flex;

  z-index: 2;

  position: absolute;
  top: 92px;
  left: 0;
`;
const Stack2 = styled(Image)`
  width: 565px;
  min-width: 565px;
  height: 347px;
  min-height: 347px;
`;
const RevealStack3 = styled(Reveal)`
  display: flex;

  z-index: 3;

  position: absolute;
  top: 95px;
  right: 48px;
`;
const Stack3 = styled(Image)`
  width: 227px;
  min-width: 227px;
  height: 60px;
  min-height: 60px;

  filter: drop-shadow(0px 16px 32px rgba(0, 0, 0, 0.54));
`;
const Title = styled.h1`
  color: #fff;
  text-align: right;
  font-family: ${unbounded.style.fontFamily};
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;
