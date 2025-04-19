import { HeroSection } from '@/components/main/sections/HeroSection';
import { HybridSection } from '@/components/main/sections/HybridSection';
import { SwapSection } from '@/components/main/sections/SwapSection';
import Header from '@/components/header';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      <Header />
      <div className="pt-[72px]">
        <HeroSection />
        <HybridSection />
        <SwapSection />
      </div>
    </div>
  );
}
