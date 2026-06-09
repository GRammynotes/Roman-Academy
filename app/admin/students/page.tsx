"use client";

import { useState, useEffect } from "react";
import { Download, Search, Plus, UserCog, Archive, KeyRound, Eye, Edit2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddStudentModal } from "@/components/students/add-student-modal";
import { StudentProfileDrawer } from "@/components/students/student-profile-drawer";

type StudentResult = {
  id: string;
  fullName: string;
  classLevel: string;
  batchType: string;
  stream: string;
  whatsappContact: string;
  testResults: Array<{ percentage: number }>;
  ranks: Array<{ rank: number }>;
  attendance: Array<{ attended: boolean }>;
  syllabus: Array<{ status: string, chapter: { chapterName: string } }>;
  user?: { username: string };
};

export default function AdminStudentsPage() {
  const [stream, setStream] = useState("SCIENCE_PCM");
  const [classLevel, setClassLevel] = useState("TWELVE");
  const [batch, setBatch] = useState("12th Science 2026");
  
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

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

  // Update batch automatically when stream/class changes
  useEffect(() => {
    setBatch(batchMap[stream]?.[classLevel] || "all");
  }, [stream, classLevel]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/search?batch=${encodeURIComponent(batch)}&classLevel=${encodeURIComponent(classLevel)}&stream=${encodeURIComponent(stream)}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [batch, classLevel, stream]);

  return (
    <AppShell active="/admin/students" role="teacher">
      <PageHeader eyebrow="Academy Workflow" title="Student Management">
        <Badge tone="gold">Manage profiles & workflow</Badge>
      </PageHeader>

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-gold-600 hover:bg-gold-700 text-white">
          <Plus className="size-4" /> Add Student
        </Button>
        <Button variant="secondary" className="gap-2 border-gold-500/20 text-navy-800">
          <UserCog className="size-4 text-gold-600" /> Update Existing
        </Button>
        <Button variant="secondary" className="gap-2 border-gold-500/20 text-navy-800">
          <Archive className="size-4 text-gold-600" /> Archive Student
        </Button>
        <Button variant="secondary" className="gap-2 border-gold-500/20 text-navy-800">
          <KeyRound className="size-4 text-gold-600" /> Reset Password
        </Button>
      </div>

      <Card className="mb-6 border-gold-500/20 shadow-md">
        <CardHeader className="bg-ivory-50/50 border-b border-gold-500/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Search className="size-4 text-gold-600" /> Filter Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex gap-4 bg-white items-end flex-wrap">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600">Stream</label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm text-navy-950 outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="SCIENCE_PCM">Science</option>
              <option value="COMMERCE_ADDON">Commerce</option>
              <option value="NEET_ADDON">NEET</option>
            </select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600">Class</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm text-navy-950 outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="ELEVEN">11th Standard</option>
              <option value="TWELVE">12th Standard</option>
            </select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600">Batch</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-ivory-50 px-3 text-sm text-navy-950 outline-none focus:ring-1 focus:ring-gold-500 font-semibold text-gold-800"
            >
              <option value={batchMap[stream]?.[classLevel]}>{batchMap[stream]?.[classLevel]}</option>
              <option value="all">All Batches</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Student Table */}
      <Card className="border-gold-500/20 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ivory-100/50 text-navy-600 uppercase tracking-wider text-xs border-b border-gold-500/20">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Attendance</th>
                <th className="px-4 py-3 font-semibold">Avg %</th>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Current Chapter</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/10 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-navy-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-navy-500">No students found.</td>
                </tr>
              ) : (
                students.map((student) => {
                  const avgScore = student.testResults?.length
                    ? Math.round(
                        student.testResults.reduce((sum, r) => sum + r.percentage, 0) /
                        student.testResults.length
                      )
                    : 0;
                  
                  const attendanceTotal = student.attendance?.length || 0;
                  const attendancePresent = student.attendance?.filter(a => a.attended).length || 0;
                  const attPercent = attendanceTotal > 0 ? Math.round((attendancePresent/attendanceTotal)*100) : 0;
                  
                  const currentRank = student.ranks?.[0]?.rank || "-";
                  const ongoingChapter = student.syllabus?.find(s => s.status === "ONGOING")?.chapter?.chapterName || "-";

                  return (
                    <tr key={student.id} className="hover:bg-ivory-50/50 transition-colors cursor-pointer" onClick={() => setSelectedStudent(student)}>
                      <td className="px-4 py-3 font-medium text-navy-950">{student.fullName}</td>
                      <td className="px-4 py-3 text-navy-800">{student.batchType}</td>
                      <td className="px-4 py-3 text-navy-800">{student.whatsappContact || "-"}</td>
                      <td className="px-4 py-3 text-navy-800">{attPercent}%</td>
                      <td className="px-4 py-3">
                        <Badge tone={avgScore >= 75 ? "green" : avgScore >= 65 ? "gold" : "red"}>{avgScore}%</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-950">#{currentRank}</td>
                      <td className="px-4 py-3 text-navy-800">{ongoingChapter}</td>
                      <td className="px-4 py-3">
                        <Badge tone="green">Active</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button className="p-1.5 text-navy-600 hover:text-gold-600 hover:bg-gold-50 rounded" title="View" onClick={() => setSelectedStudent(student)}>
                            <Eye className="size-4" />
                          </button>
                          <button className="p-1.5 text-navy-600 hover:text-gold-600 hover:bg-gold-50 rounded" title="Edit">
                            <Edit2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals & Drawers */}
      {isAddModalOpen && (
        <AddStudentModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            loadStudents(); // reload list
          }} 
        />
      )}

      {selectedStudent && (
        <StudentProfileDrawer 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}

    </AppShell>
  );
}
