"use client";

import { Crown, Sparkles, TrendingUp } from "lucide-react";
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
    <div className="student-profile-card p-6 md:p-8">
      {/* Shimmer overlay */}
      <div className="shimmer" aria-hidden="true" />

      {/* Content wrapper */}
      <div className="relative z-10 space-y-6">
        {/* Header Badge */}
        <div className="flex justify-center">
          <Badge className="border-gold-300/50 bg-gold-300/15 text-gold-300 uppercase tracking-wider">
            {rank ? `Rank #${rank}` : "Rank pending"}
          </Badge>
        </div>

        {/* Avatar Section */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Avatar circle */}
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-white/15 shadow-[0_10px_30px_rgba(2,6,23,0.6),0_6px_18px_rgba(0,0,0,0.5),0_0_40px_rgba(59,130,246,0.05)]">
              <div className="student-avatar-placeholder">
                {initials(fullName)}
              </div>
            </div>
          </div>
        </div>

        {/* Title & Batch */}
        <div className="text-center space-y-2">
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold uppercase tracking-wider text-white">
            {fullName}
          </h2>
          <p className="text-gold-300 font-semibold uppercase tracking-[0.15em] text-sm">
            {batch}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Attendance",
              value: `${attendance ?? 0}%`,
              color: "text-cyan-400"
            },
            {
              label: "Overall",
              value: `${overall ?? 0}%`,
              color: "text-blue-400"
            },
            {
              label: "CET Ready",
              value: `${cetReadiness ?? 0}%`,
              color: "text-purple-400"
            },
            {
              label: "Progress",
              value: `${mainProgress}%`,
              color: "text-amber-400"
            }
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-3 text-center hover:border-white/20 transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-white/70">
                {label}
              </p>
              <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="uppercase tracking-wider text-white/70 font-semibold">
              Syllabus Progress
            </span>
            <span className="text-gold-400 font-bold">{mainProgress}%</span>
          </div>
          <Progress
            value={mainProgress}
            className="h-2 bg-white/15 rounded-full"
          />
        </div>

        {/* Current Chapter & Next Test */}
        <div className="space-y-3 rounded-lg border border-gold-400/30 bg-gold-400/12 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-400/70 font-semibold">
                Current Chapter
              </p>
              <p className="text-sm text-white font-semibold mt-0.5">
                {currentChapter || "Not started"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-2 border-t border-gold-400/20">
            <TrendingUp className="size-5 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-400/70 font-semibold">
                Next Test
              </p>
              <p className="text-sm text-white font-semibold mt-0.5">
                {nextTest || "Not scheduled"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/50">
          <Crown className="size-3 text-gold-400" />
          <span>Premium Student Profile</span>
        </div>
      </div>
    </div>
  );
}
