import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Clock, GraduationCap, ShieldAlert } from "lucide-react";

export default function StudentSupport() {
  return (
    <AppShell active="/student/support" role="student">
      <PageHeader eyebrow="Student Portal" title="Academy Support">
        <Badge tone="gold">Internal Contacts</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 max-w-4xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="size-5 text-gold-600" /> Academic Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-ivory-100/70 leading-relaxed">
                For questions related to syllabus, test schedule, mock exams, and chapter doubts, please contact the academic head.
              </p>
              <div className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/50 space-y-3">
                <p className="font-bold text-white">Navnath Roman</p>
                <div className="flex items-center gap-3 text-sm text-ivory-100/70">
                  <Phone className="size-4 text-gold-600" />
                  <a href="tel:+919172765002" className="hover:text-gold-300 transition-colors">+91 917276 5002</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-ivory-100/70">
                  <Clock className="size-4 text-gold-600" />
                  <span>Mon–Sat: 9 AM – 8 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="size-5 text-gold-600" /> Technical & Portal Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-ivory-100/70 leading-relaxed">
                For issues with the dashboard, login problems, or missing test results, contact the technical team.
              </p>
              <div className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/50 space-y-3">
                <p className="font-bold text-white">Kunal Datkhile</p>
                <div className="flex items-center gap-3 text-sm text-ivory-100/70">
                  <Phone className="size-4 text-gold-600" />
                  <a href="tel:+919172765002" className="hover:text-gold-300 transition-colors">+91 91727 65002</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-ivory-100/70">
                  <Mail className="size-4 text-gold-600" />
                  <a href="mailto:Datkhilekunalvijay@gmail.com" className="hover:text-gold-300 transition-colors">Datkhilekunalvijay@gmail.com</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Academy Address</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/50">
              <p className="font-bold text-white mb-2">Main Branch</p>
              <p className="text-sm text-ivory-100/60 leading-relaxed">A/2, Room 501/502, Sector-20<br />Turbhe, Navi Mumbai - 400703<br />Near Turbhe Railway Station</p>
            </div>
            <div className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/50">
              <p className="font-bold text-white mb-2">Branch 2</p>
              <p className="text-sm text-ivory-100/60 leading-relaxed">A1, 64/B, Sector-21, Turbhe<br />Near ICL School & Mayuresh Hospital<br />2nd Floor, Navi Mumbai</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
