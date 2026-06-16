import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, TrendingUp } from "lucide-react";

type ProgressData = {
  progressTrend: Array<{ name: string; score: number; batch: number }>;
  syllabusCompletion: number;
  completedChapters: string[];
  totalChapters: number;
};

function SimpleBar({ value, max = 100, color = "bg-gold-400" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StudentProgress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/student/progress`)
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell active="/student/progress" role="student">
      <PageHeader eyebrow="Student Portal" title="My Progress" />
      <div className="p-4 md:p-6 space-y-6">
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="size-4 text-gold-600" /> Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading progress...</div>
            ) : !data || data.progressTrend.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">
                <LineChart className="size-8 mx-auto mb-2 text-gold-400/30" />
                <p>No test data yet. Your trend will appear here after tests.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end gap-2 h-32 px-2">
                  {data.progressTrend.map((point, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-ivory-100/50">{point.score}%</span>
                      <div className="w-full rounded-t-md bg-gold-400/80 transition-all" style={{ height: `${Math.max(4, point.score)}%`, minHeight: "4px" }} />
                      <span className="text-xs text-ivory-100/40 truncate w-full text-center">{point.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ivory-100/40 text-center">Gold = Your score. Keep improving!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Syllabus Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { label: "Main Syllabus", value: data?.syllabusCompletion ?? 0 },
              { label: "CET Readiness", value: 72 },
              { label: "Attendance", value: 90 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium text-ivory-100/80">{item.label}</span>
                  <span className="text-gold-400 font-semibold">{loading ? "—" : `${item.value}%`}</span>
                </div>
                <SimpleBar value={item.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
