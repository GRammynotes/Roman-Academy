import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  trend
}: {
  label: string;
  value: string;
  detail: string;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-navy-800/60">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-navy-950">{value}</p>
          </div>
          {trend && trend !== "flat" ? (
            <div className={cn("rounded-full p-2", trend === "up" ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200")}>
              {trend === "up" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-navy-800/65">{detail}</p>
      </CardContent>
    </Card>
  );
}
