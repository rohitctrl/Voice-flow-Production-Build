import VoiceflowHero from "@/components/ui/sonic-waveform";
import { InteractiveDemo } from "@/components/ui/interactive-demo";
import { BenefitsSection } from "@/components/ui/benefits-section";
import { UseCasesSection } from "@/components/ui/use-cases-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { PricingSection } from "@/components/ui/pricing-section";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { FinalCTASection } from "@/components/ui/final-cta-section";
import { FloatingRecordButton } from "@/components/ui/floating-record-button";

export default function Home() {
  return (
    <main className="App bg-gradient-to-b from-black via-gray-950 via-gray-900 via-gray-950 to-black relative overflow-hidden">
      {/* Unified Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle animated orbs that complement the waveform */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-gray-700/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-gray-600/5 via-gray-700/5 to-gray-800/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent opacity-50"></div>
      </div>
      <VoiceflowHero />
      <InteractiveDemo />
      <FeaturesSection />
      <BenefitsSection />
      <UseCasesSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTASection />
      <FloatingRecordButton />
    </main>
  )
}