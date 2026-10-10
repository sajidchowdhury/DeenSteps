import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { HeroSection } from './sections/hero'
import { HowItWorksSection } from './sections/how-it-works'
import { FeatureShowcaseSection } from './sections/feature-showcase'
import { RewardsPreviewSection } from './sections/rewards-preview'
import { IslamicValuesSection } from './sections/islamic-values'
import { PricingSection } from './sections/pricing'
import { FaqSection } from './sections/faq'
import { CtaSection } from './sections/cta'

export function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeatureShowcaseSection />
        <RewardsPreviewSection />
        <IslamicValuesSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
