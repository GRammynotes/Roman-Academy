import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, BookOpen, Calendar, Trophy } from "lucide-react";

type Profile = {
  id: string;
  fullName: string;
  whatsappContact: string;
  classLevel: string;
  stream: string;
  batchType: string;
  joinedDate: string;
  rank: number | null;
  average: number | null;
  attendance: number;
  cetReadiness: number;
  currentChapter: string;
  mainProgress: number;
  completedChapters: string[];
};

export default function StudentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/student/profile`)
      .then(r => r.json()).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell active="/student/profile" role="student">
        <div className="p-6 text-center text-ivory-100/50">Loading profile...</div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell active="/student/profile" role="student">
        <div className="p-6 text-center text-ivory-100/50">Could not load profile. Please try again.</div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/student/profile" role="student">
      <PageHeader eyebrow="Student Portal" title="My Profile">
        <Badge tone="gold">{profile.batchType}</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-6">
        <Card className="border-gold-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-16 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-300 border border-gold-400/30">
              <User className="size-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{profile.fullName}</h3>
              <p className="text-sm text-ivory-100/60">{profile.batchType} · {profile.stream}</p>
              {profile.whatsappContact && (
                <p className="text-xs text-ivory-100/40 mt-0.5">+{profile.whatsappContact}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Score", value: profile.average ? `${profile.average}%` : "N/A", icon: Trophy },
            { label: "Rank", value: profile.rank ? `#${profile.rank}` : "N/A", icon: Trophy },
            { label: "Attendance", value: `${profile.attendance}%`, icon: Calendar },
            { label: "CET Ready", value: `${profile.cetReadiness}%`, icon: BookOpen },
          ].map(item => (
            <Card key={item.label} className="border-gold-500/15">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-ivory-100/50 uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="size-4 text-gold-400" /> Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ivory-100/60">Current Chapter</span>
              <span className="font-semibold text-white">{profile.currentChapter}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ivory-100/60">Joined</span>
              <span className="font-semibold text-white">{profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString("en-IN") : "N/A"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ivory-100/60">Syllabus Progress</span>
              <span className="font-semibold text-gold-400">{profile.mainProgress}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
