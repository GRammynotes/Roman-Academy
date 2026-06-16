"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaderboardStudent = {
  id: string;
  fullName: string;
  batchType: string;
  average: number;
  lastTest: number;
  rank: number;
  rankMovement: number | null;
};

export default function LeaderboardPage() {
  const [scope, setScope] = useState<"weekly" | "monthly" | "quarterly" | "overall">("weekly");
  const [stream, setStream] = useState("SCIENCE_PCM");
  const [classLevel, setClassLevel] = useState("TWELVE");
  const [batch, setBatch] = useState("12th Science 2026");

  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const batchMap: Record<string, Record<string, string>> = {
    SCIENCE_PCM: {
      ELEVEN: "11th Science 2026",
      TWELVE: "12th Science 2026",
    },
    COMMERCE_ADDON: {
      ELEVEN: "11th Commerce 2026",
      TWELVE: "12th Commerce 2026",
    },
    NEET_ADDON: {
      ELEVEN: "11th Science 2026",
      TWELVE: "12th Science 2026",
    }
  };

  useEffect(() => {
    setBatch(batchMap[stream]?.[classLevel] || "all");
  }, [stream, classLevel]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/leaderboard?scope=${scope}&batch=${encodeURIComponent(batch)}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data || []);
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [scope, batch]);

  return (
    <AppShell active="/teacher/leaderboard" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Batch Leaderboard">
        <Badge tone="gold">HackerRank Weighted Rankings</Badge>
      </PageHeader>

      {/* Scope Selector Tabs */}
      <div className="flex gap-2 border-b border-gold-500/10 mt-6 pb-px overflow-x-auto whitespace-nowrap">
        {[
          { key: "weekly", label: "Weekly Tests (20%)" },
          { key: "monthly", label: "Monthly Tests (30%)" },
          { key: "quarterly", label: "Quarterly Tests (50%)" },
          { key: "overall", label: "Overall Weighted" }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setScope(item.key as any)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              scope === item.key
                ? "border-gold-500 text-gold-300 font-bold"
                : "border-transparent text-ivory-100/60 hover:text-ivory-100/90"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Filter Header */}
      <Card className="my-6 border-gold-500/20 shadow-md">
        <CardContent className="p-4 grid gap-4 md:grid-cols-3 items-end bg-white">
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase">Stream</label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="SCIENCE_PCM">Science</option>
              <option value="COMMERCE_ADDON">Commerce</option>
              <option value="NEET_ADDON">NEET</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase">Class</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="ELEVEN">11th Standard</option>
              <option value="TWELVE">12th Standard</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase">Batch</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm outline-none focus:ring-1 focus:ring-gold-500 font-semibold text-gold-700"
            >
              <option value={batchMap[stream]?.[classLevel]}>{batchMap[stream]?.[classLevel]}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gold-500/20 shadow-md">
        <CardHeader className="bg-white/80 border-b border-gold-500/10">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-4 text-gold-600" />
            Rankings for {batch}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-4 gap-2 rounded-xl border border-gold-500/20 bg-navy-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-300 md:grid-cols-[80px_1fr_150px_110px_110px_110px]">
            <span>Rank</span>
            <span>Student</span>
            <span className="hidden md:block">Batch</span>
            <span>Weighted %</span>
            <span className="hidden md:block">Last Score</span>
            <span>Movement</span>
          </div>

          {loading ? (
            <p className="text-sm text-navy-600 text-center py-6">Loading leaderboard data...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-navy-600 text-center py-6">No leaderboard rankings recorded yet.</p>
          ) : (
            students.map((student, index) => (
              <div
                key={student.id}
                className="grid grid-cols-4 gap-2 rounded-xl border border-gold-500/20 bg-ivory-50 p-3 text-sm md:grid-cols-[80px_1fr_150px_110px_110px_110px] md:items-center hover:bg-gold-50/20 transition-all"
              >
                <p className="flex items-center gap-2 text-lg font-bold text-gold-700">
                  {index < 3 ? <Medal className="size-4 text-gold-600 animate-pulse" /> : null}
                  #{student.rank}
                </p>
                <div>
                  <p className="font-bold text-navy-950">{student.fullName}</p>
                </div>
                <p className="hidden text-navy-800/70 md:block">{student.batchType}</p>
                <div>
                  <Badge tone={student.average >= 75 ? "green" : student.average >= 65 ? "gold" : "red"}>
                    {student.average}%
                  </Badge>
                </div>
                <p className="hidden text-navy-800 md:block">{student.lastTest}%</p>
                <div className="flex items-center gap-1">
                  {student.rankMovement === null ? (
                    <span className="text-xs text-navy-500 bg-white px-2 py-0.5 rounded border border-gold-500/10">New</span>
                  ) : student.rankMovement > 0 ? (
                    <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-bold">
                      <ArrowUp className="size-3.5" />
                      {student.rankMovement}
                    </span>
                  ) : student.rankMovement < 0 ? (
                    <span className="flex items-center gap-0.5 text-xs text-rose-600 font-bold">
                      <ArrowDown className="size-3.5" />
                      {Math.abs(student.rankMovement)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-xs text-navy-400">
                      <Minus className="size-3.5" />
                      0
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
