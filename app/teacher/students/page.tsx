import { KeyRound, MessageSquareText, Save } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherStudents } from "@/lib/academy";

export default async function StudentsPage() {
  const students = await getTeacherStudents("12th Batch 2026");

  return (
    <AppShell active="/teacher/students" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Student management">
        <Badge tone="gold">12th Batch 2026 baseline</Badge>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Add or edit student</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Full Name", "fullName"],
                ["Username", "username"],
                ["Student Phone", "studentPhone"],
                ["Parent Phone", "parentPhone"],
                ["Join Date", "joinDate"]
              ].map(([label, name]) => (
                <label key={name} className="space-y-2 text-sm text-navy-800">
                  <span>{label}</span>
                  <input className="h-10 w-full rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40" name={name} placeholder={label} />
                </label>
              ))}
              <label className="space-y-2 text-sm text-navy-800">
                <span>Batch</span>
                <select className="h-10 w-full rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40" defaultValue="12th Batch 2026">
                  <option>12th Batch 2026</option>
                  <option>11th Batch 2026</option>
                  <option>12th Commerce Batch 2026</option>
                  <option>11th Commerce Batch 2026</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-navy-800">
                <span>Stream</span>
                <select className="h-10 w-full rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40" defaultValue="Science">
                  <option>Science</option>
                  <option>Commerce</option>
                </select>
              </label>
            </div>
            <label className="space-y-2 text-sm text-navy-800">
              <span>Notes</span>
              <textarea className="min-h-24 w-full resize-none rounded-lg border border-gold-500/25 bg-ivory-50 px-3 py-2 text-sm text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40" placeholder="Notes" />
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="secondary"><KeyRound className="size-4" /> Generate Secure Password</Button>
              <Button><Save className="size-4" /> Save Student</Button>
              <Button variant="secondary"><MessageSquareText className="size-4" /> Save & Send Credentials</Button>
            </div>
            <div className="rounded-xl border border-gold-500/20 bg-gold-400/10 p-3 text-sm text-navy-800/75">
              Save creates the student profile, leaderboard entry, progress record, and attendance seed through `/api/students`.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current students</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex flex-col gap-3 rounded-xl border border-gold-500/20 bg-ivory-50 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-navy-950">{student.fullName}</p>
                  <p className="text-sm text-navy-800/65">{student.username} | Joined {student.joinedDate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="blue">{student.classLevel}</Badge>
                  <Badge tone="gold">{student.batchType}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
