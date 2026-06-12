"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, BookOpen, AlertCircle, ArrowUpRight } from "lucide-react";

export default function TeacherPage() {
  const stats = {
    totalStudents: 45,
    avgScore: 78,
    testsCreated: 12,
    lowPerformers: 6
  };

  const recentActivity = [
    { name: "Kunal Datkhile", action: "Completed Quiz", score: "92%" },
    { name: "Rujula Khamkar", action: "Submitted Assignment", score: "85%" },
    { name: "Arjun Sharma", action: "Started Chapter 5", score: "" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 dark:from-navy-950 to-ivory-50 dark:to-navy-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gold-500/10 bg-white dark:bg-navy-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <h1 className="font-bold text-navy-950 dark:text-white">Teacher Dashboard</h1>
              <p className="text-xs text-navy-800/60 dark:text-ivory-300/60">Academic Command Center</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 rounded-lg bg-gold-400 text-navy-950 font-semibold hover:bg-gold-300 transition text-sm">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Total Students</p>
              <p className="text-3xl font-bold text-navy-950 dark:text-white mt-2">{stats.totalStudents}</p>
              <p className="text-xs text-gold-600 mt-2">Active enrolments</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Avg Score</p>
              <p className="text-3xl font-bold text-navy-950 dark:text-white mt-2">{stats.avgScore}%</p>
              <p className="text-xs text-green-600 mt-2">Class average</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Tests Created</p>
              <p className="text-3xl font-bold text-navy-950 dark:text-white mt-2">{stats.testsCreated}</p>
              <p className="text-xs text-gold-600 mt-2">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Weak Performers</p>
              <p className="text-3xl font-bold text-navy-950 dark:text-white mt-2">{stats.lowPerformers}</p>
              <p className="text-xs text-rose-600 mt-2">Below 65% avg</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-gold-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gold-500/15 bg-white dark:bg-navy-900 hover:border-gold-500/40 transition">
                  <div>
                    <p className="font-semibold text-navy-950 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-navy-800/70 dark:text-ivory-300/70">{item.action}</p>
                  </div>
                  {item.score && <Badge tone="gold">{item.score}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gold-500/20 h-fit">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-gold-50/10 dark:hover:bg-navy-900 transition text-sm font-semibold text-navy-950 dark:text-ivory-100">
                <BookOpen className="size-4 text-gold-600" />
                <span>Create Test</span>
                <ArrowUpRight className="size-3 ml-auto text-navy-500/50" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-gold-50/10 dark:hover:bg-navy-900 transition text-sm font-semibold text-navy-950 dark:text-ivory-100">
                <Users className="size-4 text-gold-600" />
                <span>Manage Class</span>
                <ArrowUpRight className="size-3 ml-auto text-navy-500/50" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-gold-50/10 dark:hover:bg-navy-900 transition text-sm font-semibold text-navy-950 dark:text-ivory-100">
                <AlertCircle className="size-4 text-gold-600" />
                <span>Send Alert</span>
                <ArrowUpRight className="size-3 ml-auto text-navy-500/50" />
              </a>
            </CardContent>
          </Card>
        </div>

       {/* Demo Info */}
       <div className="mt-8 p-6 rounded-lg border border-gold-500/20 bg-gold-50/50 dark:bg-navy-900/50">
         <p className="text-sm text-navy-800 dark:text-ivory-300">
           <strong>This is a demo view.</strong> Login with teacher credentials (roman_sir / Roman@123) to access full functionality including test creation, student management, and analytics.
         </p>
       </div>
     </div>
   </div>
 );
}
