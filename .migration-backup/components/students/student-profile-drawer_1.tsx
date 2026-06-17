import { X, User as UserIcon, Phone, BookOpen, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentProfileDrawerProps {
  student: any;
  onClose: () => void;
}

export function StudentProfileDrawer({ student, onClose }: StudentProfileDrawerProps) {
  if (!student) return null;

  const avgScore = student.testResults?.length
    ? Math.round(
        student.testResults.reduce((sum: number, r: any) => sum + r.percentage, 0) /
        student.testResults.length
      )
    : 0;

  const currentRank = student.ranks?.[0]?.rank || "N/A";
  
  // Find current chapter from syllabus where status is ONGOING
  const ongoingChapter = student.syllabus?.find((s: any) => s.status === "ONGOING")?.chapter?.chapterName || "N/A";

  const attendanceTotal = student.attendance?.length || 0;
  const attendancePresent = student.attendance?.filter((a: any) => a.attended).length || 0;
  const attendancePercentage = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-ivory-50 h-full shadow-2xl flex flex-col border-l border-gold-500/20 animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b border-gold-500/10 bg-white">
          <h2 className="text-lg font-semibold text-navy-950">Student Profile</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ivory-100 text-navy-600 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-700">
              <UserIcon className="size-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy-950">{student.fullName}</h3>
              <p className="text-sm text-navy-800/70">{student.batchType} • {student.stream}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gold-500/20 bg-white">
              <p className="text-xs text-navy-600 uppercase tracking-wider font-semibold">Average</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{avgScore}%</p>
            </div>
            <div className="p-4 rounded-xl border border-gold-500/20 bg-white">
              <p className="text-xs text-navy-600 uppercase tracking-wider font-semibold">Rank</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">#{currentRank}</p>
            </div>
            <div className="p-4 rounded-xl border border-gold-500/20 bg-white">
              <p className="text-xs text-navy-600 uppercase tracking-wider font-semibold">Attendance</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{attendancePercentage}%</p>
            </div>
            <div className="p-4 rounded-xl border border-gold-500/20 bg-white">
              <p className="text-xs text-navy-600 uppercase tracking-wider font-semibold">Tests</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{student.testResults?.length || 0}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-navy-950 uppercase tracking-wider border-b border-gold-500/10 pb-2">Academic Details</h4>
            
            <div className="flex items-start gap-3">
              <BookOpen className="size-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy-950">Current Chapter</p>
                <p className="text-sm text-navy-800/70">{ongoingChapter}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy-950">Latest Test</p>
                <p className="text-sm text-navy-800/70">
                  {student.testResults?.[0] ? `${student.testResults[0].percentage}%` : "No tests yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-navy-950 uppercase tracking-wider border-b border-gold-500/10 pb-2">Contact & Login</h4>
            
            <div className="flex items-start gap-3">
              <Phone className="size-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy-950">Student Contact</p>
                <p className="text-sm text-navy-800/70">{student.whatsappContact || "N/A"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="size-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy-950">Parent Contact</p>
                <p className="text-sm text-navy-800/70">{student.parentContact || "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-navy-50 border border-navy-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Username</span>
                <span className="text-sm font-mono text-navy-950 bg-white px-2 py-0.5 rounded border border-navy-200">{student.user?.username || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Password (Reset)</span>
                <span className="text-sm font-mono text-navy-950 bg-white px-2 py-0.5 rounded border border-navy-200">Hidden</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
