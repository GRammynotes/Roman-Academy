import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

type TestResult = {
  id: string;
  testName: string;
  testType: string;
  date: string;
  percentage: number;
  rank: number | string;
  chapters: string[];
  teacherNote: string;
  aiNote: string;
};

export default function StudentTests() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/student/tests`)
      .then(r => r.json()).then(setTests).catch(() => setTests([])).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell active="/student/tests" role="student">
      <PageHeader eyebrow="Student Portal" title="Test History" />
      <div className="p-4 md:p-6 space-y-4">
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarDays className="size-4 text-gold-600" /> Your Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading test history...</div>
            ) : tests.length === 0 ? (
              <div className="rounded-lg border border-gold-500/20 bg-navy-900/50 p-8 text-center">
                <CalendarDays className="size-8 mx-auto mb-2 text-gold-400/40" />
                <p className="text-sm text-ivory-100/60">No tests uploaded yet.</p>
                <p className="mt-1 text-xs text-ivory-100/40">Tests will appear here once your teacher uploads marks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <details key={test.id} className="rounded-xl border border-gold-500/20 bg-navy-900/50 p-4 cursor-pointer group hover:border-gold-500/30 transition">
                    <summary className="font-semibold text-white flex items-center justify-between list-none">
                      <div>
                        <span>{test.testName}</span>
                        <p className="text-xs text-ivory-100/50 mt-0.5 font-normal">{test.testType} · {test.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={test.percentage >= 75 ? "success" : test.percentage >= 60 ? "gold" : "danger"}>{test.percentage}%</Badge>
                        <Badge tone="info">Rank #{test.rank}</Badge>
                      </div>
                    </summary>
                    <div className="mt-4 space-y-2 text-sm text-ivory-100/70 border-t border-gold-500/10 pt-4">
                      {test.chapters.length > 0 && (
                        <p><span className="font-semibold text-ivory-100">Chapters:</span> {test.chapters.join(", ")}</p>
                      )}
                      {test.teacherNote && (
                        <p><span className="font-semibold text-ivory-100">Teacher Note:</span> {test.teacherNote}</p>
                      )}
                      {test.aiNote && (
                        <p><span className="font-semibold text-ivory-100">AI Insight:</span> {test.aiNote}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
