'use client';

export function ResultsGallery() {
  return (
    <section className="relative px-4 py-16 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Results Banner Image - Exact Brochure Design */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gold-400/20 hover:shadow-xl transition-shadow">
          <img 
            src="/results-banner.svg" 
            alt="Roman Academy Results 2026 - Congratulations to Our Shining Stars"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
