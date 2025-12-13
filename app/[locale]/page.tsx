import HeroSection from '@/components/landing/HeroSection';
import EcosystemGrid from '@/components/landing/EcosystemGrid';
import AxoCoinSection from '@/components/landing/AxoCoinSection';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-[#00E676] selection:text-black">
      <HeroSection />
      <EcosystemGrid />
      <AxoCoinSection />
    </div>
  );
}
