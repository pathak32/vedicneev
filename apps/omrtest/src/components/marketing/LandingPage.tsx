import { FeatureGrid } from "./FeatureGrid";
import { Hero } from "./Hero";
import { PricingTiers } from "./PricingTiers";
import { RoiCalculator } from "./RoiCalculator";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { TrustBanner } from "./TrustBanner";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustBanner />
        <FeatureGrid />
        <RoiCalculator />
        <PricingTiers />
      </main>
      <SiteFooter />
    </div>
  );
}
