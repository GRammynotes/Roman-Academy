import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-navy-900/12", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
