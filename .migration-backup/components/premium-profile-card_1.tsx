import { Camera, Crown, Sparkles, TrendingUp, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { StudentSummary } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function metric(value: number | null, suffix = "") {
  return value === null ? "Not set" : `${value}${suffix}`;
}

export function PremiumProfileCard({ student }: { student: StudentSummary }) {
  return (
    <section
      id="profile"
      className="premium-profile-card group relative min-h-[520px] overflow-hidden rounded-[22px] border border-gold-400/45 bg-navy-950 p-5 text-white shadow-elite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(214,162,44,0.22),transparent_34%),linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
      <div className="absolute inset-0 rounded-[22px] border border-white/10" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between">
          <Badge tone="gold" className="border-gold-300/50 bg-gold-300/15 text-gold-300">
            {student.rank === null ? "Rank pending" : `Rank #${student.rank}`}
          </Badge>
          <div className="flex gap-2">
            <button className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/10 text-gold-300 transition hover:bg-white/15" title="Generate avatar">
              <UserRound className="size-4" />
            </button>
            <button className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/10 text-gold-300 transition hover:bg-white/15" title="Upload photo">
              <Camera className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center text-center">
          <div className="relative grid size-36 place-items-center rounded-full border border-gold-300/50 bg-gradient-to-br from-gold-300 via-gold-500 to-navy-900 shadow-[0_20px_60px_rgba(214,162,44,0.28)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-1">
            <div className="absolute inset-3 rounded-full border border-white/20 bg-navy-950/90" />
            <span className="relative font-serif text-5xl font-bold tracking-wide text-gold-300">{initials(student.fullName)}</span>
          </div>
          <h2 className="mt-5 font-serif text-3xl font-semibold">{student.fullName}</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-gold-300">{student.batchType}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge tone="gold" className="border-gold-300/50 bg-gold-300/15 text-gold-300">{student.classLevel}th</Badge>
            <Badge tone="blue" className="border-white/15 bg-white/10 text-ivory-50">{student.stream}</Badge>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {[
            ["Attendance", metric(student.attendance, "%")],
            ["Overall", metric(student.average, "%")],
            ["CET Ready", metric(student.cetReadiness, "%")],
            ["Last Test", metric(student.lastTest, "%")]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/8 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-ivory-100/55">{label}</p>
              <p className="mt-1 text-xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-ivory-100/75">Progress meter</span>
              <span className="text-gold-300">{student.mainProgress}%</span>
            </div>
            <Progress value={student.mainProgress} className="bg-white/12" />
          </div>
          <div className="rounded-xl border border-gold-300/20 bg-gold-300/10 p-3 text-sm leading-6 text-ivory-50">
            <p className="flex items-center gap-2 font-semibold text-gold-300"><Sparkles className="size-4" /> Current: {student.currentChapter || "Not started"}</p>
            <p className="mt-1 flex items-center gap-2"><TrendingUp className="size-4 text-gold-300" /> Next test: {student.nextTest || "Not scheduled"}</p>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2 text-sm text-ivory-100/70">
            <Crown className="size-4 text-gold-300" />
            Hover card supports premium tilt/glow treatment.
          </div>
        </div>
      </div>
    </section>
  );
}
