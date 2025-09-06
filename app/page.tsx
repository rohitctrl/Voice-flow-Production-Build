import { Hero } from "@/components/ui/animated-hero";
import { InteractiveDemo } from "@/components/ui/interactive-demo";
import { UseCasesSection } from "@/components/ui/use-cases-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { PricingSection } from "@/components/ui/pricing-section";
import { FloatingRecordButton } from "@/components/ui/floating-record-button";
import { Squares } from "@/components/ui/squares-background";
import VoiceflowHero from "@/components/ui/sonic-waveform";

export default function Home() {
  return (
    <main className="App relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <Squares 
          direction="diagonal"
          speed={0.3}
          squareSize={40}
          borderColor="#111" 
          hoverFillColor="#1a1a1a"
        />
      </div>
      <VoiceflowHero />
      <div id="demo">
        <InteractiveDemo />
      </div>
      <FeaturesSection />
      <UseCasesSection />
      <PricingSection />
      <FloatingRecordButton />
    </main>
  )
}