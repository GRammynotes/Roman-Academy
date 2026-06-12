"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ArrowUpRight, BookOpen, Flame, ShieldCheck } from "lucide-react";

export default function StudentPage() {
  const [notifications] = useState([
    { id: 1, title: "Test Results", body: "Weekly Physics Quiz results available", date: "Today" },
    { id: 2, title: "Syllabus Update", body: "Chapter 5 marked complete", date: "Yesterday" }
  ]);

  const student = {
    name: "Kunal Datkhile",
    rank: 5,
    batch: "11th Science",
    average: 85,
    nextTest: "Physics Quiz - Tomorrow"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 dark:from-navy-950 to-ivory-50 dark:to-navy-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gold-500/10 bg-white dark:bg-navy-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <h1 className="font-bold text-navy-950 dark:text-white">Student Dashboard</h1>
              <p className="text-xs text-navy-800/60 dark:text-ivory-300/60">Welcome back</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 rounded-lg bg-gold-400 text-navy-950 font-semibold hover:bg-gold-300 transition text-sm">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-950 dark:text-white mb-2">Hello, {student.name}! ??</h2>
          <p className="text-navy-800/70 dark:text-ivory-300/70">Here's your learning overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Rank</p>
              <p className="text-3xl font-bold text-navy-950 dark:text-white mt-2">#{student.rank}</p>
              <p className="text-xs text-gold-600 mt-2">In your batch</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Average</p>
              <p className="text-3xl font-bold text-navy-950 dark:text-white mt-2">{student.average}%</p>
              <p className="text-xs text-green-600 mt-2">Very Good!</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Batch</p>
              <p className="text-lg font-bold text-navy-950 dark:text-white mt-2">{student.batch}</p>
              <p className="text-xs text-gold-600 mt-2">Science PCM</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-navy-800/70 dark:text-ivory-300/70">Next Test</p>
              <p className="text-sm font-bold text-navy-950 dark:text-white mt-2">{student.nextTest}</p>
              <p className="text-xs text-rose-600 mt-2">12 hours away</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Notifications */}
          <div className="md:col-span-2">
            <Card className="border-gold-500/20">
              <CardHeader className="border-b border-gold-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="size-5 text-gold-600 animate-pulse" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <Badge tone="red" className="text-xs">{notifications.length} new</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-lg border border-gold-500/15 bg-white dark:bg-navy-900 hover:border-gold-500/40 transition">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-semibold text-navy-950 dark:text-white text-sm">{notif.title}</p>
                      <span className="text-xs text-navy-500/60 dark:text-ivory-300/50">{notif.date}</span>
                    </div>
                    <p className="text-xs text-navy-800/70 dark:text-ivory-300/70">{notif.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-gold-500/20 h-fit">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-gold-50/10 dark:hover:bg-navy-900 transition text-sm font-semibold text-navy-950 dark:text-ivory-100">
                <BookOpen className="size-4 text-gold-600" />
                <span>View Tests</span>
                <ArrowUpRight className="size-3 ml-auto text-navy-500/50" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-gold-50/10 dark:hover:bg-navy-900 transition text-sm font-semibold text-navy-950 dark:text-ivory-100">
                <Flame className="size-4 text-gold-600" />
                <span>Leaderboard</span>
                <ArrowUpRight className="size-3 ml-auto text-navy-500/50" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-gold-50/10 dark:hover:bg-navy-900 transition text-sm font-semibold text-navy-950 dark:text-ivory-100">
                <ShieldCheck className="size-4 text-gold-600" />
                <span>Progress</span>
                <ArrowUpRight className="size-3 ml-auto text-navy-500/50" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-6 rounded-lg border border-gold-500/20 bg-gold-50/50 dark:bg-navy-900/50">
          <p className="text-sm text-navy-800 dark:text-ivory-300">
            <strong>This is a demo view.</strong> Login with your actual credentials to see your real data, tests, progress, and personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
