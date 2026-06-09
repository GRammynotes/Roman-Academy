"use client";

import { Camera, Crown, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StudentProfileCard({
  fullName,
  rank,
  batch,
  attendance,
  overall,
  cetReadiness,
  currentChapter,
  nextTest,
  mainProgress
}: {
  fullName: string;
  rank: number | null;
  batch: string;
  attendance: number | null;
  overall: number | null;
  cetReadiness: number | null;
  currentChapter: string | null;
  nextTest: string | null;
  mainProgress: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-gold-400/45 bg-gradient-to-b from-navy-950 to-navy-900 p-5 text-white shadow-[0_8px_30px_rgba(214,162,44,0.08),0_8px_30px_rgba(147,51,234,0.06)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(214,162,44,0.15)]">
      {/* Animated border */}
      <div className="absolute inset-0 rounded-[22px]" style={{
        background: "linear-gradient(90deg, #3b82f6, #9333ea, #06b6d4, #f59e0b)",
        backgroundSize: "300% 300%",
        animation: "borderSweep 4s linear infinite",
        opacity: 0.3,
        pointerEvents: "none"
      }} />

      {/* Background gradient */}
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-gold-400/15 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className="border-gold-300/50 bg-gold-300/15 text-gold-300">
            {rank ? `Rank #${rank}` : "Rank pending"}
          </Badge>
          <button className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/10 text-gold-300 transition hover:bg-white/15">
            <Camera className="size-4" />
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center">
          <div className="relative grid size-28 place-items-center rounded-full border border-gold-300/50 bg-gradient-to-br from-gold-300 via-gold-500 to-navy-900 shadow-[0_20px_60px_rgba(214,162,44,0.28)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-1">
            <div className="absolute inset-2 rounded-full border border-white/20 bg-navy-950/90" />
            <span className="relative font-serif text-4xl font-bold tracking-wide text-gold-300">
              {initials(fullName)}
            </span>
          </div>
          <h2 className="mt-4 font-serif text-2xl font-semibold">{fullName}</h2>
          <p className="mt-1 text-sm uppercase tracking-[0.18em] text-gold-300">{batch}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Attendance", `${attendance ?? 0}%`],
            ["Overall", `${overall ?? 0}%`],
            ["CET Ready", `${cetReadiness ?? 0}%`],
            ["Progress", `${mainProgress}%`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/8 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-ivory-100/55">{label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ivory-100/75">Syllabus Progress</span>
            <span className="text-gold-300 font-semibold">{mainProgress}%</span>
          </div>
          <Progress value={mainProgress} className="bg-white/12" />
        </div>

        {/* Current & Next */}
        <div className="rounded-xl border border-gold-300/20 bg-gold-300/10 p-3 text-sm space-y-2">
          <p className="flex items-center gap-2 font-semibold text-gold-300">
            <Sparkles className="size-4" /> Current: {currentChapter || "Not started"}
          </p>
          <p className="flex items-center gap-2 text-ivory-100/75">
            <TrendingUp className="size-4 text-gold-300" /> Next test: {nextTest || "Not scheduled"}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gold-400/20 flex items-center gap-2 text-xs text-ivory-100/60">
          <Crown className="size-3 text-gold-300" />
          <span>Premium profile card</span>
        </div>
      </div>

      <style>{`
        @keyframes borderSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
