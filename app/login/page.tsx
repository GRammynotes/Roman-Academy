"use client";

import { useState } from "react";
import { LockKeyhole, ShieldCheck, ChevronRight, Loader2, BookOpen, Target, Users } from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";

export default function LoginPage() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate real credential verification and redirect using demo auth routes
    setTimeout(() => {
      window.location.href = `/api/auth/demo?role=${role}`;
    }, 800);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-navy-950 font-sans">
      <div className="w-full max-w-5xl bg-navy-900 border border-gold-400/20 rounded-[22px] overflow-hidden shadow-elite grid md:grid-cols-[55fr_45fr] min-h-[600px]">
        
        {/* Left Side: Brochure-first Brand Panel (Desktop only) */}
        <div className="hidden md:flex w-full h-full flex-col justify-between bg-navy-950 border-r border-gold-400/15 p-10 text-white">
          <div className="space-y-6">
            <RomanWordmark className="items-start" />
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Personal tuition | Concept focused | Result driven</p>
              <h2 className="max-w-md text-3xl font-bold font-serif leading-tight">
                For students aiming beyond limits.
              </h2>
              <p className="max-w-md text-sm leading-6 text-white/65">
                Science PCM/PCB, Commerce, CET, and NEET Foundation coaching with small batches, concept clarity, smart practice, and exam-focused preparation.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-gold-400/20 bg-navy-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">Courses</p>
                <BookOpen className="size-4 text-gold-400" />
              </div>
              <p className="mt-3 text-xl font-bold text-white">Science | Commerce | NEET</p>
              <p className="mt-1 text-xs text-white/60">11th | 12th | CET preparation</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gold-400/20 bg-navy-900 p-4">
                <Target className="size-4 text-gold-400" />
                <p className="mt-3 text-base font-bold text-white">Smart Practice</p>
                <p className="text-xs text-white/60">Regular tests and tracking</p>
              </div>
              <div className="rounded-xl border border-gold-400/20 bg-navy-900 p-4">
                <Users className="size-4 text-gold-400" />
                <p className="mt-3 text-base font-bold text-white">Personal Attention</p>
                <p className="text-xs text-white/60">Small batches for focus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login Form */}
        <div className="flex flex-col justify-center p-6 md:p-10 bg-navy-900 text-white space-y-6">
          <div className="text-center space-y-2">
            <RomanWordmark compact className="mx-auto" />
            <h1 className="text-xl font-bold tracking-tight text-white mt-4">Academy Portal</h1>
            <p className="text-xs text-white/60">Enter your credentials to access your dashboard</p>
          </div>

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-navy-950 rounded-xl border border-gold-400/10">
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setEmail("kunal.datkhile@romanacademy.in");
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                role === "student"
                  ? "bg-gold-400 text-navy-950"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <LockKeyhole className="size-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("teacher");
                setEmail("abhijeet.roman@romanacademy.in");
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                role === "teacher"
                  ? "bg-gold-400 text-navy-950"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <ShieldCheck className="size-3.5" />
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-gold-400 uppercase tracking-wider block">
                Email or Username
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "student" ? "kunal.datkhile@romanacademy.in" : "abhijeet.roman@romanacademy.in"}
                className="w-full h-11 px-4 rounded-lg bg-navy-950 border border-gold-400/20 text-white placeholder-white/30 focus:ring-1 focus:ring-gold-400 focus:outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-gold-400 uppercase tracking-wider block">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-lg bg-navy-950 border border-gold-400/20 text-white placeholder-white/30 focus:ring-1 focus:ring-gold-400 focus:outline-none text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-gold-400 text-navy-950 font-bold hover:bg-gold-300 transition-colors text-sm disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="rounded-xl border border-gold-400/15 bg-navy-950 p-4 text-[11px] leading-relaxed text-white/60">
            {role === "student" ? (
              <span>First login launches a brief guided walkthrough. Returning logins skip the walkthrough directly to stats.</span>
            ) : (
              <span>Teacher accounts provide syllabus configuration, marks uploads, and automated WhatsApp queue checks.</span>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
