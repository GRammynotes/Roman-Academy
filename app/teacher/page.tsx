import Link from "next/link";
import { AlertTriangle, ArrowRight, MessageSquareText, Users } from "lucide-react";
import { AdminCommandBox } from "@/components/admin-command-box";
import { AppShell, PageHeader } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTeacherDashboard, getWhatsAppDrafts } from "@/lib/academy";

export default async function TeacherDashboardPage() {
  const dashboard = await getTeacherDashboard("12th Batch 2026");
  const drafts = await getWhatsAppDrafts("12th Batch 2026");
  const weakStudents = dashboard.priorityStudents;

  return (
    <AppShell active="/teacher">
      <PageHeader eyebrow="Teacher Portal" title="Academic command center">
        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/upload-marks" className="inline-flex h-10 items-center justify-center rounded-lg bg-gold-400 px-4 text-sm font-semibold text-navy-950 transition hover:bg-gold-300">Upload marks</Link>
          <Link href="/teacher/whatsapp" className="inline-flex h-10 items-center justify-center rounded-lg border border-gold-400/35 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15">Generate WhatsApp Draft</Link>
          <Link href="/admin/students" className="inline-flex h-10 items-center justify-center rounded-lg border border-gold-400/35 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15">Search & Reports</Link>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Students tracked" value={`${dashboard.studentsTracked}`} detail="Filtered by batch" trend="flat" />
        <MetricCard label="Batch average" value={`${dashboard.batchAverage}%`} detail="Latest batch performance" trend="up" />
        <MetricCard label="Weak students" value={`${dashboard.weakStudentCount}`} detail="Below 65% average" trend="down" />
        <MetricCard label="Review queue" value={`${dashboard.reviewQueue}`} detail="WhatsApp drafts pending" trend="flat" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Student overview</CardTitle>
              <p className="text-sm text-navy-800/65">Fast list, no heavy chart load.</p>
            </div>
            <Users className="size-5 text-gold-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.studentOverview.map((student) => (
              <Link key={student.id} href="/student" className="grid gap-3 rounded-xl border border-gold-500/20 bg-ivory-50 p-3 transition hover:border-gold-500/60 md:grid-cols-[1fr_140px_120px_100px] md:items-center">
                <div>
                  <p className="font-semibold text-navy-950">{student.fullName}</p>
                  <p className="text-sm text-navy-800/65">{student.batchType}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-800/60">Main progress</p>
                  <Progress value={student.mainProgress} className="mt-2" />
                </div>
                <Badge tone={(student.average ?? 0) >= 75 ? "green" : (student.average ?? 0) >= 65 ? "gold" : "red"}>{student.average ?? "N/A"}% avg</Badge>
                <p className="text-sm text-navy-800">Rank #{student.rank}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-gold-600" />
              Priority students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakStudents.map((student) => (
              <div key={student.id} className="rounded-xl border border-rose-400/20 bg-rose-400/8 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-950">{student.fullName}</p>
                    <p className="mt-1 text-sm text-navy-800/75">{student.aiNote}</p>
                  </div>
                  <Badge tone="red">Catch-up</Badge>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-gold-400/25 bg-gold-400/10 p-3">
              <p className="text-sm font-semibold text-gold-600">Upcoming quarterly alert</p>
              <p className="mt-1 text-sm text-navy-800/75">Quarterly tests appear as profile popups 7 days and 1 day before test date.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Syllabus progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.roadmap.map((step, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{step.chapterName}</span>
                  <span className="text-gold-600">{step.priority}</span>
                </div>
                <Progress value={Math.floor(100 / dashboard.roadmap.length)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>WhatsApp queue preview</CardTitle>
              <p className="text-sm text-navy-800/65">Drafts are never sent without review.</p>
            </div>
            <MessageSquareText className="size-5 text-gold-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-xl border border-gold-500/20 bg-ivory-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-navy-950">{draft.student}</p>
                  <Badge tone="blue">{draft.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-navy-800/75">{draft.draft}</p>
              </div>
            ))}
            <Link href="/teacher/whatsapp" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600">
              Open queue <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>12th running roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.roadmap.map((item, index) => (
              <details key={item.chapterName} className="rounded-xl border border-gold-500/20 bg-ivory-50 p-3">
                <summary className="cursor-pointer font-semibold text-navy-950">{item.chapterName}</summary>
                <p className="mt-2 text-sm text-navy-800/75">Subject: {item.subject}</p>
              </details>
            ))}
          </CardContent>
        </Card>
        <AdminCommandBox />
      </div>
    </AppShell>
  );
}
