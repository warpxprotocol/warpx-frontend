import { HeroSection } from '@/app/(home)/components/HeroSection';
import { HybridSection } from '@/app/(home)/components/HybridSection';
import { SwapSection } from '@/app/(home)/components/SwapSection';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      <HeroSection />
      <HybridSection />
      <SwapSection />
    </div>
  );
}
