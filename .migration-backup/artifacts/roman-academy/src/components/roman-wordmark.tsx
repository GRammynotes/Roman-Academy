import { cn } from "@/lib/utils";

export function RomanWordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-label="Roman Academy">
      <div className="w-8 h-8 rounded-lg bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-gold-300 font-bold text-lg">
        ⌁
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-gold-300 font-extrabold text-sm tracking-widest">ROMAN</span>
        <span className="text-white font-extrabold text-sm tracking-widest">ACADEMY</span>
        {!compact && <span className="text-gold-300/60 text-[9px] font-bold tracking-[0.2em] mt-0.5">11TH • 12TH • CET</span>}
      </div>
    </div>
  );
}
