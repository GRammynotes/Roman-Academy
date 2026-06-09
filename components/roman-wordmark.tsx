import { cn } from "@/lib/utils";

export function RomanWordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("roman-wordmark", compact && "roman-wordmark-compact", className)} aria-label="Roman Academy">
      <div className="roman-crest" aria-hidden="true">
        <span className="roman-crest-book">⌁</span>
      </div>
      <div className="roman-name">
        <span className="roman-gold">ROMAN</span>
        <span className="roman-white">ACADEMY</span>
      </div>
      <div className="roman-track">11TH • 12TH • CET</div>
    </div>
  );
}
