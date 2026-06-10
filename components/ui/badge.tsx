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
        tone === "gold" && "border-gold-500/40 bg-gold-400/15 text-gold-300",
        tone === "green" && "border-emerald-500/40 bg-emerald-600/20 text-emerald-300",
        tone === "red" && "border-rose-500/40 bg-rose-600/20 text-rose-300",
        tone === "blue" && "border-blue-500/40 bg-blue-600/20 text-blue-300",
        tone === "neutral" && "border-ivory-100/10 bg-ivory-100/5 text-ivory-100",
        className
      )}
      {...props}
    />
  );
}
