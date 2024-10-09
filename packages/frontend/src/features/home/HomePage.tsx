import styled from '@emotion/styled';
import { NextPage } from 'next';

import { HeroSection } from '@/features/home/sections/HeroSection';
import { HybridSection } from '@/features/home/sections/HybridSection';

const Home: NextPage = () => {
  return (
    <Wrapper>
      <HeroSection />
      <HybridSection />
    </Wrapper>
  );
};

export default Home;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
