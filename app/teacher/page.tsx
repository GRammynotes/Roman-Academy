import Link from "next/link";
import { AlertTriangle, ArrowRight, MessageSquareText, Users, CalendarDays, Award, Upload, ClipboardList, TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTeacherDashboard, getWhatsAppDrafts, getTeacherSchedule, getTeacherLeaderboard } from "@/lib/academy";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboardPage() {
  const batchName = "12th Batch 2026";
  const dashboard = await getTeacherDashboard(batchName);
  const drafts = await getWhatsAppDrafts(batchName);
  const schedule = await getTeacherSchedule(batchName);
  const leaderboard = await getTeacherLeaderboard("overall", batchName);

  // Fetch actual uploaded tests using Prisma
  const recentTests = await prisma.test.findMany({
    orderBy: { date: "desc" },
    take: 3
  });

  const weakStudents = dashboard.priorityStudents;
  const activeSchedule = schedule.filter(s => s.status === "UPCOMING" || s.status === "IN_PROGRESS").slice(0, 3);

  return (
    <AppShell active="/teacher" role="teacher">
      <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto text-white">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-400/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-400">Teacher Portal</p>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white mt-1">Academic Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/teacher/upload-marks" className="inline-flex h-9 items-center justify-center rounded-lg bg-gold-400 px-4 text-xs font-bold text-navy-950 transition hover:bg-gold-300">
              <Upload className="mr-1.5 size-3.5" /> Upload Marks
            </Link>
            <Link href="/teacher/whatsapp" className="inline-flex h-9 items-center justify-center rounded-lg border border-gold-400/35 bg-white/5 px-4 text-xs font-bold text-white transition hover:bg-white/10">
              WhatsApp Queue
            </Link>
          </div>
        </div>

        {/* Workflow Metrics: Upload | Analyze | Review | Notify */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            label="Students" 
            value={`${dashboard.studentsTracked}`} 
            detail="Active learners to review" 
            trend="flat" 
          />
          <MetricCard 
            label="Tests Uploaded" 
            value={`${recentTests.length}`} 
            detail="Recent uploads ready for review" 
            trend="up" 
          />
          <MetricCard 
            label="Pending AI Analysis" 
            value={`${dashboard.weakStudentCount}`} 
            detail="Students needing catch-up action" 
            trend="down" 
          />
          <MetricCard 
            label="WhatsApp Queue" 
            value={`${dashboard.reviewQueue}`} 
            detail="WhatsApp drafts pending review" 
            trend="up" 
          />
        </div>

        <Card className="bg-navy-900 border-gold-400/20 text-white">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-4">
            {[
              { label: "Upload", href: "/teacher/upload-marks", icon: Upload },
              { label: "Analyze", href: "/teacher", icon: AlertTriangle },
              { label: "Review", href: "/teacher/students", icon: ClipboardList },
              { label: "Notify", href: "/teacher/whatsapp", icon: MessageSquareText }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <Link
                  key={step.label}
                  href={step.href}
                  className="flex items-center justify-between rounded-lg border border-gold-400/15 bg-navy-950 px-4 py-3 text-sm font-bold text-white transition hover:border-gold-400/35 hover:bg-white/5"
                >
                  <span>{step.label}</span>
                  <Icon className="size-4 text-gold-400" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Middle Row: Recent Uploads | AI Insights | Today's Schedule */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Recent Uploads */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3 flex items-center justify-between flex-row">
              <CardTitle className="text-xs uppercase tracking-wider text-white">Recent Uploaded Tests</CardTitle>
              <Upload className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recentTests.length > 0 ? (
                recentTests.map((test) => (
                  <div key={test.id} className="p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                    <p className="font-bold text-xs text-white">{test.testName}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {test.testType.replace("_", " ")} • {new Date(test.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-white/40 italic">
                  No recently uploaded marks.
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights (Priority Students) */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3 flex items-center justify-between flex-row">
              <CardTitle className="text-xs uppercase tracking-wider text-white">AI Insights / Catch-Up</CardTitle>
              <AlertTriangle className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
              {weakStudents.length > 0 ? (
                weakStudents.map((student) => (
                  <div key={student.id} className="p-3 rounded-lg bg-navy-950 border border-rose-500/20 text-white">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{student.fullName}</span>
                      <Badge tone="red" className="text-[9px]">Catch-up</Badge>
                    </div>
                    <p className="text-[10px] text-white/70 mt-1 leading-relaxed">{student.aiNote || "Needs support in rotational dynamics CET mocks."}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-white/40 italic">
                  All students are currently on track.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3 flex items-center justify-between flex-row">
              <CardTitle className="text-xs uppercase tracking-wider text-white">Academic Schedule</CardTitle>
              <CalendarDays className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activeSchedule.length > 0 ? (
                activeSchedule.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gold-400">{item.testName}</span>
                      <span className="text-[9px] text-emerald-400 uppercase font-bold">{item.testType.replace("_", " ")}</span>
                    </div>
                    <p className="text-[10px] text-white/60 mt-1">Syllabus: {item.chapters.join(", ")}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-white/40 italic">
                  No upcoming schedule.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Bottom Row: Leaderboard | WhatsApp Queue | Performance Trends */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Leaderboard */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3 flex items-center justify-between flex-row">
              <CardTitle className="text-xs uppercase tracking-wider text-white">Topper Leaderboard</CardTitle>
              <Award className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {leaderboard.slice(0, 3).map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-gold-400/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold-400">#{index + 1}</span>
                    <span className="text-xs text-white font-semibold">{student.fullName}</span>
                  </div>
                  <Badge tone="gold" className="text-[10px]">{student.computedScore}%</Badge>
                </div>
              ))}
              <Link href="/teacher/leaderboard" className="inline-flex items-center gap-1.5 text-xs text-gold-400 font-bold hover:text-gold-300 transition-colors mt-2">
                Open Leaderboard <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* WhatsApp Queue */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3 flex items-center justify-between flex-row">
              <CardTitle className="text-xs uppercase tracking-wider text-white">WhatsApp Queue Preview</CardTitle>
              <MessageSquareText className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {drafts.slice(0, 2).map((draft) => (
                <div key={draft.id} className="p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white">{draft.student}</span>
                    <span className="text-gold-400 font-semibold">{draft.cadence}</span>
                  </div>
                  <p className="text-[10px] text-white/70 mt-1.5 line-clamp-2 leading-relaxed">{draft.draft}</p>
                </div>
              ))}
              <Link href="/teacher/whatsapp" className="inline-flex items-center gap-1.5 text-xs text-gold-400 font-bold hover:text-gold-300 transition-colors mt-2">
                Review WhatsApp queue <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3 flex items-center justify-between flex-row">
              <CardTitle className="text-xs uppercase tracking-wider text-white">Batch Performance Averages</CardTitle>
              <TrendingUp className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-white/75">12th Science average score</span>
                  <span className="text-gold-400 font-bold">{dashboard.batchAverage}%</span>
                </div>
                <Progress value={dashboard.batchAverage} />
              </div>
              
              <div className="p-3 rounded-lg bg-navy-950 border border-gold-400/10 space-y-1">
                <p className="text-[10px] font-bold text-gold-400 uppercase">Director Mentorship Note</p>
                <p className="text-[10px] text-white/70 leading-relaxed">
                  Batches are progressing on Differentiation & Rotational Dynamics. Focus weekly tests on derivation questions.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </AppShell>
  );
}
