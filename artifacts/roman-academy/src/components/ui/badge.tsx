import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover-elevate",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        outline:     "text-foreground border [border-color:var(--badge-outline)]",
      },
      tone: {
        gold:    "border-gold-500/30 bg-gold-400/10 text-gold-300",
        navy:    "border-navy-700/60 bg-navy-900/60 text-ivory-100/80",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        danger:  "border-red-500/30 bg-red-500/10 text-red-400",
        info:    "border-sky-500/30 bg-sky-500/10 text-sky-400",
        warn:    "border-amber-500/30 bg-amber-500/10 text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  tone?: "gold" | "navy" | "success" | "danger" | "info" | "warn";
}

function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, tone }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
