import Header from '@/components/header';
import { HeroSection } from '@/components/main/sections/HeroSection';
import { HybridSection } from '@/components/main/sections/HybridSection';
import { SwapSection } from '@/components/main/sections/SwapSection';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      <Header />
      <div className="pt-1">
        <HeroSection />
        <HybridSection />
        <SwapSection />
      </div>
    </div>
  );
}
