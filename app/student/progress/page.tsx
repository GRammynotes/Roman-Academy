import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileChartClient as ProfileChart } from "@/components/profile-chart-client";
import { getStudentProgress } from "@/lib/academy";
import { LineChart } from "lucide-react";

export default async function StudentProgressPage() {
  const student = await getStudentProgress();
  const subjects = Object.keys(student?.subjects ?? {}) as string[];
  const progressTrend = student?.progressTrend ?? [];

  return (
    <AppShell active="/student/progress" role="student">
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader eyebrow="Student Portal" title="My Progress" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="size-4 text-gold-600" />
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileChart data={progressTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.length ? (
              subjects.map((subject) => {
                const marks = student?.subjects?.[subject] ?? { scored: 0, maxMarks: 0 };
                const percent = marks.maxMarks > 0 ? Math.round((marks.scored / marks.maxMarks) * 100) : 0;

                return (
                  <div key={subject}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-navy-950">{subject}</span>
                      <span className="text-navy-800/75">{marks.scored}/{marks.maxMarks} | {percent}%</span>
                    </div>
                    <Progress value={percent} />
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-gold-500/20 bg-ivory-50 p-4 text-sm text-navy-800/75">
                No subject marks available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Syllabus Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Main Syllabus</span>
                <span className="text-gold-600 font-semibold">{student?.mainProgress ?? 0}%</span>
              </div>
              <Progress value={student?.mainProgress ?? 0} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>CET Readiness</span>
                <span className="text-gold-600 font-semibold">{student?.cetReadiness ?? 0}%</span>
              </div>
              <Progress value={student?.cetReadiness ?? 0} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Attendance</span>
                <span className="text-gold-600 font-semibold">{student?.attendance ?? 0}%</span>
              </div>
              <Progress value={student?.attendance ?? 0} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
