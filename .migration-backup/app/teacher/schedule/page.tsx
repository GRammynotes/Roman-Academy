"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ListTodo, Award, HelpCircle, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TestScheduleItem = {
  id: string;
  testName: string;
  testType: string;
  date: string;
  scheduledDate: string;
  status: string;
  chapters: string[];
  batchName: string;
  classLevel: string;
  stream: string;
};

export default function SchedulePage() {
  const [stream, setStream] = useState("SCIENCE_PCM");
  const [classLevel, setClassLevel] = useState("TWELVE");
  const [batch, setBatch] = useState("12th Science 2026");
  const [testTypeFilter, setTestTypeFilter] = useState("all");

  const [tests, setTests] = useState<TestScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestScheduleItem | null>(null);
  const [countdownText, setCountdownText] = useState("");

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

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/schedule?batch=${encodeURIComponent(batch)}`);
      if (res.ok) {
        const data = await res.json();
        setTests(data || []);
      }
    } catch (error) {
      console.error("Failed to load schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [batch]);

  // Next test countdown calculation (Mumbai Timezone Asia/Kolkata)
  useEffect(() => {
    if (!tests.length) {
      setCountdownText("No upcoming tests");
      return;
    }

    const upcoming = tests
      .filter((t) => t.status === "UPCOMING" || t.status === "IN_PROGRESS")
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    if (!upcoming.length) {
      setCountdownText("No upcoming tests");
      return;
    }

    const nextTest = upcoming[0];
    const targetDate = new Date(nextTest.scheduledDate);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdownText(`${nextTest.testName} is in progress!`);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setCountdownText(`${days}d ${hours}h ${minutes}m until ${nextTest.testName}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [tests]);

  const filteredTests = tests.filter((t) => {
    if (testTypeFilter !== "all" && t.testType !== testTypeFilter) return false;
    return true;
  });

  const upcomingTests = filteredTests.filter((t) => t.status === "UPCOMING");
  const completedTests = filteredTests.filter((t) => t.status === "COMPLETED");
  const inProgressTests = filteredTests.filter((t) => t.status === "IN_PROGRESS");

  return (
    <AppShell active="/teacher/schedule" role="teacher">
      <PageHeader eyebrow="Academy Planner" title="Test Schedule">
        <Badge tone="gold">Asia/Kolkata Timezone (GMT+5:30)</Badge>
      </PageHeader>

      <div className="grid gap-4 mt-6 md:grid-cols-3">
        <Card className="bg-navy-900 border-gold-500/20 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider">Next Test Countdown</p>
              <p className="text-sm font-bold mt-1 text-ivory-100">{countdownText}</p>
            </div>
            <Clock className="size-8 text-gold-500/80" />
          </CardContent>
        </Card>

        <Card className="bg-navy-900 border-gold-500/20 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider">Total Tests in Batch</p>
              <p className="text-2xl font-bold mt-1 text-ivory-100">{tests.length}</p>
            </div>
            <Calendar className="size-8 text-gold-500/80" />
          </CardContent>
        </Card>

        <Card className="bg-navy-900 border-gold-500/20 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider">Completed Tests</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">{tests.filter(t => t.status === "COMPLETED").length}</p>
            </div>
            <Award className="size-8 text-emerald-500/80" />
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Filter Header */}
      <Card className="my-6 border-gold-500/20 shadow-md">
        <CardHeader className="bg-ivory-50/50 border-b border-gold-500/10 py-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Planner Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid gap-4 md:grid-cols-4 items-end bg-white">
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800 uppercase">Test Type</label>
            <select
              value={testTypeFilter}
              onChange={(e) => setTestTypeFilter(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="all">All Types</option>
              <option value="WEEKLY_CHAPTER">Weekly Chapter Test</option>
              <option value="MONTHLY">Monthly Test</option>
              <option value="QUARTERLY">Quarterly Test</option>
              <option value="FULL_LENGTH_MOCK">Full Length Mock</option>
              <option value="REVISION_TEST">Revision Test</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Scheduler Lists */}
      <div className="space-y-6">
        {inProgressTests.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">In Progress</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressTests.map((t) => (
                <Card key={t.id} onClick={() => setSelectedTest(t)} className="border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy-950 text-base">{t.testName}</p>
                      <p className="text-xs text-navy-800/60 mt-1">{t.testType} • {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                    </div>
                    <Badge tone="gold">In Progress</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-gold-600 uppercase tracking-widest mb-3">Upcoming Tests</h3>
          {loading ? (
            <p className="text-sm text-navy-600">Loading schedule...</p>
          ) : upcomingTests.length === 0 ? (
            <Card className="p-6 text-center text-sm text-navy-600 border-gold-500/20 bg-ivory-50">No upcoming tests scheduled for this batch.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingTests.map((t) => (
                <Card key={t.id} onClick={() => setSelectedTest(t)} className="border-gold-500/20 hover:border-gold-500/50 cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy-950 text-base">{t.testName}</p>
                      <p className="text-xs text-navy-800/60 mt-1">
                        {t.testType} • {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </p>
                    </div>
                    <Badge tone="blue">Scheduled</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Completed Tests</h3>
          {loading ? (
            <p className="text-sm text-navy-600">Loading schedule...</p>
          ) : completedTests.length === 0 ? (
            <Card className="p-6 text-center text-sm text-navy-600 border-gold-500/20 bg-ivory-50">No completed tests.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedTests.map((t) => (
                <Card key={t.id} onClick={() => setSelectedTest(t)} className="border-gold-500/20 hover:border-gold-500/50 cursor-pointer bg-emerald-50/20 transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy-950 text-base">{t.testName}</p>
                      <p className="text-xs text-navy-800/60 mt-1">
                        {t.testType} • {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </p>
                    </div>
                    <Badge tone="green">Completed</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Detail Popup Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-ivory-50 rounded-2xl shadow-xl overflow-hidden border border-gold-500/25">
            <div className="flex items-center justify-between p-4 border-b border-gold-500/10 bg-white">
              <h3 className="text-base font-bold text-navy-950">Test Specifications</h3>
              <button onClick={() => setSelectedTest(null)} className="p-1 rounded-md hover:bg-ivory-100 text-navy-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-navy-600 uppercase">Test Name</span>
                  <p className="font-semibold text-navy-950 mt-0.5">{selectedTest.testName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-navy-600 uppercase">Test Type</span>
                  <p className="font-semibold text-navy-950 mt-0.5">{selectedTest.testType}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-navy-600 uppercase">Batch</span>
                  <p className="font-semibold text-navy-950 mt-0.5">{selectedTest.batchName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-navy-600 uppercase">Status</span>
                  <p className="mt-0.5">
                    <Badge tone={selectedTest.status === "COMPLETED" ? "green" : selectedTest.status === "IN_PROGRESS" ? "gold" : "blue"}>
                      {selectedTest.status}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-navy-600 uppercase">Date & Time (Mumbai)</span>
                <p className="font-semibold text-navy-950 mt-0.5">
                  {new Date(selectedTest.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long" })} · {new Date(selectedTest.date).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", timeStyle: "short" })}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-navy-600 uppercase">Chapters Included</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedTest.chapters.map((ch, idx) => (
                    <Badge key={idx} tone="gold" className="text-xs">{ch}</Badge>
                  ))}
                  {selectedTest.chapters.length === 0 && <span className="text-navy-500">None assigned</span>}
                </div>
              </div>

              <div className="p-3 bg-gold-400/10 border border-gold-500/20 rounded-lg">
                <span className="text-xs font-bold text-gold-700 uppercase">Syllabus Block Relevance</span>
                <p className="text-xs text-navy-800 mt-1 font-semibold">
                  {selectedTest.testType === "WEEKLY_CHAPTER" && "Targeted single-chapter evaluation."}
                  {selectedTest.testType === "MONTHLY" && "Unit test reviewing recent roadmap block."}
                  {selectedTest.testType === "QUARTERLY" && "Comprehensive quarter evaluation milestone."}
                  {selectedTest.testType === "FULL_LENGTH_MOCK" && "Simulates final CET layout coverage."}
                  {selectedTest.testType === "REVISION_TEST" && "Revision testing targeted for catch-up support."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
