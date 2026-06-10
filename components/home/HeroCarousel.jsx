"use client";

import { InteractiveImageAccordion } from "@/components/ui/interactive-image-accordion";

export default function HeroCarousel({ slides }) {
  const items = slides?.length ? slides : [];

  return (
    <section
      data-testid="hero-carousel"
      className="relative overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0 opacity-[0.05] animate-phoenix mix-blend-screen pointer-events-none"
        style={{
         // backgroundImage: "url('/background.webp')",
          backgroundSize: "55% auto",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-0 pb-8 md:pt-6 md:pb-12">
        <div className="w-full">
          <InteractiveImageAccordion slides={items} />
        </div>
      </div>
    </section>
  );
}
