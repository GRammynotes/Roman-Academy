import type * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gold-400/50 disabled:opacity-50",
        variant === "primary" && "bg-gold-400 text-navy-950 hover:bg-gold-300",
        variant === "secondary" && "border border-gold-500/25 bg-ivory-50 text-navy-950 hover:bg-ivory-100",
        variant === "ghost" && "text-navy-800 hover:bg-navy-900/5 hover:text-navy-950",
        className
      )}
      {...props}
    />
  );
}
