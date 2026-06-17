import type * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "gold" | "green" | "red" | "blue" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "gold" && "border-gold-500/40 bg-gold-400/15 text-gold-600",
        tone === "green" && "border-emerald-700/25 bg-emerald-600/10 text-emerald-800",
        tone === "red" && "border-rose-700/25 bg-rose-600/10 text-rose-800",
        tone === "blue" && "border-navy-800/25 bg-navy-800/10 text-navy-800",
        tone === "neutral" && "border-navy-900/10 bg-navy-900/5 text-navy-900",
        className
      )}
      {...props}
    />
  );
}
