import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { HeroSection } from './sections/hero'
import { HowItWorksSection } from './sections/how-it-works'
import { FeatureShowcaseSection } from './sections/feature-showcase'
import { ProductPreviewSection } from './sections/product-preview'
import { IslamicValuesSection } from './sections/islamic-values'
import { CtaSection } from './sections/cta'

export function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeatureShowcaseSection />
        <ProductPreviewSection />
        <IslamicValuesSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
