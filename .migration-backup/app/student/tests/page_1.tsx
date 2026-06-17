import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStudentTests } from "@/lib/academy";
import { CalendarDays } from "lucide-react";

export default async function StudentTestsPage() {
  const tests = await getStudentTests();

  return (
    <AppShell active="/student/tests" role="student">
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader eyebrow="Student Portal" title="Test History" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-gold-600" />
              Your Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.length ? (
              <div className="space-y-3">
                {tests.map((test) => (
                  <details
                    key={test.id}
                    className="rounded-lg border border-gold-500/20 bg-ivory-50 p-4 cursor-pointer group"
                  >
                    <summary className="font-semibold text-navy-950 flex items-center justify-between">
                      <span>{test.testName}</span>
                      <div className="flex items-center gap-2">
                        <Badge tone="gold">{test.percentage}%</Badge>
                        <Badge tone="blue">Rank #{test.rank}</Badge>
                      </div>
                    </summary>
                    <div className="mt-4 space-y-2 text-sm text-navy-800/75">
                      <p>
                        <span className="font-semibold text-navy-950">Type:</span> {test.testType}
                      </p>
                      <p>
                        <span className="font-semibold text-navy-950">Date:</span> {test.date}
                      </p>
                      <p>
                        <span className="font-semibold text-navy-950">Chapters:</span> {test.chapters.join(", ")}
                      </p>
                      <p>
                        <span className="font-semibold text-navy-950">Teacher Note:</span> {test.teacherNote}
                      </p>
                      <p>
                        <span className="font-semibold text-navy-950">AI Note:</span> {test.aiNote}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gold-500/20 bg-ivory-50 p-6 text-center text-sm text-navy-800/65">
                <p>No tests uploaded yet.</p>
                <p className="mt-2 text-xs">Tests will appear here once your teacher uploads marks.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
