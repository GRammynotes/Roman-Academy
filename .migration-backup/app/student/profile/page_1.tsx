import { AppShell, PageHeader } from "@/components/app-shell";
import { StudentProfileCard } from "@/components/student-profile-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStudentProfile } from "@/lib/academy";
import { BookOpen } from "lucide-react";

export default async function StudentProfilePage() {
  const student = await getStudentProfile();

  return (
    <AppShell active="/student/profile" role="student">
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader eyebrow="Student Portal" title="My Profile" />

        <div className="grid gap-4 lg:grid-cols-[350px_1fr]">
          <StudentProfileCard
            fullName={student?.fullName ?? "Student"}
            rank={student?.rank ?? null}
            batch={student?.batchType ?? "Unknown"}
            attendance={student?.attendance ?? 0}
            overall={student?.average ?? 0}
            cetReadiness={student?.cetReadiness ?? 0}
            currentChapter={student?.currentChapter ?? "N/A"}
            nextTest={student?.nextTest ?? "N/A"}
            mainProgress={student?.mainProgress ?? 0}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4 text-gold-600" />
                Syllabus & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student?.completedChapters?.slice(0, 4).map((chapter) => (
                <div key={chapter} className="flex items-center justify-between rounded-lg border border-gold-500/20 bg-ivory-50 p-3">
                  <span className="text-sm font-medium text-navy-950">{chapter}</span>
                  <Badge tone={chapter === student.currentChapter ? "blue" : "gold"}>
                    {chapter === student.currentChapter ? "Ongoing" : "Completed"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {student?.weakChapters?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Catch-up Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-4">
                <p className="text-sm text-rose-800 font-semibold mb-2">Topics to Revise</p>
                <p className="text-sm text-navy-800/75">{student.weakChapters.join(", ")}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
