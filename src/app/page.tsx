import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { VisualOverlays } from "@/components/VisualOverlays";
import { HeroHeader } from "@/components/HeroHeader";
import { HeroScrollSection } from "@/components/HeroScrollSection";
import { ArchitecturalConcept } from "@/components/ArchitecturalConcept";
import { ResidencesExplorer } from "@/components/ResidencesExplorer";
import { GallerySection } from "@/components/GallerySection";
import { LuxuryAmenities } from "@/components/LuxuryAmenities";
import { MaterialityShowcase } from "@/components/MaterialityShowcase";
import { LocationSection } from "@/components/LocationSection";
import { ProvenanceSection } from "@/components/ProvenanceSection";
import { InquirySection } from "@/components/InquirySection";
import { LuxuryFooter } from "@/components/LuxuryFooter";

/**
 * Server Component. Only the pieces that genuinely need the browser — the
 * pinned hero, the cursor, the smooth-scroll provider and the interactive
 * panels — ship as client islands; the rest of the page is prerendered.
 */
export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <VisualOverlays />
      <HeroHeader />

      <main id="main" className="relative bg-ink">
        <HeroScrollSection />
        <ArchitecturalConcept />
        <ResidencesExplorer />
        <GallerySection />
        <LuxuryAmenities />
        <MaterialityShowcase />
        <LocationSection />
        <ProvenanceSection />
        <InquirySection />
      </main>

      <LuxuryFooter />
    </SmoothScroll>
  );
}
