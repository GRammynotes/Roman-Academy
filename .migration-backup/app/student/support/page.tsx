"use client";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MessageSquare, Clock, GraduationCap, ShieldAlert } from "lucide-react";

export default function StudentSupportPage() {
  return (
    <AppShell active="/student/settings" role="student">
      <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
        <PageHeader eyebrow="Student Portal" title="Academy Support">
          <Badge tone="gold">Internal Contacts</Badge>
        </PageHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="border-gold-500/20 shadow-md">
            <CardHeader className="bg-white/80 border-b border-gold-500/10">
              <CardTitle className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <GraduationCap className="size-5 text-gold-600" /> Academic Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-navy-800/80 leading-relaxed">
                For questions related to syllabus, test schedule, mock exams, and chapter doubts, please contact the academic head.
              </p>
              
              <div className="p-4 rounded-xl border border-gold-500/15 bg-ivory-50 space-y-3">
                <p className="font-bold text-navy-950">Navnath Roman</p>
                <div className="flex items-center gap-3 text-sm text-navy-800">
                  <Phone className="size-4 text-gold-600" /> 
                  <a href="tel:+919172765002" className="hover:text-gold-600 transition-colors">+91 917276 5002</a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20 shadow-md">
            <CardHeader className="bg-white/80 border-b border-gold-500/10">
              <CardTitle className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <ShieldAlert className="size-5 text-gold-600" /> Admin & Technical
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-navy-800/80 leading-relaxed">
                For issues related to your dashboard login, app glitches, fee receipts, or document submissions.
              </p>
              
              <div className="p-4 rounded-xl border border-gold-500/15 bg-ivory-50 space-y-3">
                <p className="font-bold text-navy-950">Kunal Datkhile</p>
                <div className="flex items-center gap-3 text-sm text-navy-800">
                  <MessageSquare className="size-4 text-gold-600" /> 
                  <a href="https://wa.me/919172765002" target="_blank" rel="noopener noreferrer" className="hover:text-gold-600 transition-colors">WhatsApp Support</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-navy-800">
                  <Mail className="size-4 text-gold-600" /> 
                  <a href="mailto:support@romanacademy.in" className="hover:text-gold-600 transition-colors">support@romanacademy.in</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gold-500/20 shadow-md bg-gold-400/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-400/20 flex items-center justify-center border border-gold-500/30 shrink-0">
              <Clock className="size-6 text-gold-700" />
            </div>
            <div>
              <h3 className="font-bold text-navy-950 text-lg">Response Time Guidelines</h3>
              <p className="text-sm text-navy-800/80 mt-1">
                Please allow up to 24 hours for non-urgent technical queries. For urgent academic matters right before an exam, please call the academic helpline directly between 9:00 AM and 8:00 PM.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
