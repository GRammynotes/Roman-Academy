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
        variant === "secondary" && "border border-gold-500/25 bg-navy-900 text-ivory-100 hover:bg-navy-800",
        variant === "ghost" && "text-ivory-100 hover:bg-navy-800/50 hover:text-ivory-200",
        className
      )}
      {...props}
    />
  );
}
