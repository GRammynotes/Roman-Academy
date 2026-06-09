import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RomanWordmark } from "@/components/roman-wordmark";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-6xl overflow-hidden rounded-[1.25rem] border border-gold-500/45 bg-ivory-50 shadow-elite">
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div className="cover-panel relative min-h-[680px] p-6 md:p-10">
            <div className="absolute inset-x-8 bottom-8 h-16 border-b border-l border-gold-400/70" />
            <RomanWordmark className="mx-auto mt-8" />
            <div className="mx-auto mt-9 max-w-xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Personal tuition <span className="text-gold-300">|</span> Concept focused <span className="text-gold-300">|</span> Result driven
              </p>
              <p className="mt-5 font-serif text-2xl italic text-gold-300">Your Success, Our Mission.</p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {["Strong concepts", "Smart practice", "Top results"].map((item) => (
                <div key={item} className="rounded-xl border border-gold-400/25 bg-white/8 p-3 text-center text-sm font-semibold uppercase tracking-wide text-white">
                  {item}
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 right-0 hidden h-full w-24 skew-x-[-14deg] border-l border-gold-400/70 bg-ivory-50 md:block" />
          </div>
          <div className="bg-ivory-50 p-5 md:p-8">
            <div className="relative mb-5 overflow-hidden rounded-academy border border-gold-500/35 bg-white shadow-elite">
              <Image
                src="/roman-academy-cover.png"
                alt="Roman Academy cover poster"
                width={1080}
                height={1350}
                priority
                className="h-auto w-full"
              />
            </div>
            <Card>
            <CardContent className="space-y-4 p-5">
              <Link href="/api/auth/demo?role=student" className="block rounded-xl border border-gold-500/25 bg-ivory-50 p-4 transition hover:border-gold-500/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <LockKeyhole className="size-5 text-gold-600" />
                    <div>
                      <p className="font-semibold text-navy-950">Student login</p>
                      <p className="text-sm text-navy-800/70">Name-based username and generated password</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-navy-800" />
                </div>
              </Link>
              <Link href="/api/auth/demo?role=teacher" className="block rounded-xl border border-gold-400/30 bg-gold-400/10 p-4 transition hover:bg-gold-400/15">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-5 text-gold-600" />
                    <div>
                      <p className="font-semibold text-navy-950">Teacher access</p>
                      <p className="text-sm text-navy-800/70">Admin dashboard, marks, syllabus and review queue</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-navy-800" />
                </div>
              </Link>
              <div className="rounded-xl border border-gold-500/20 bg-ivory-100 p-4 text-sm leading-6 text-navy-800/75">
                First student login launches a guided walkthrough. Teacher routes use a separate admin path and confirmation previews before saving data.
              </div>
              <Link href="/api/auth/demo?role=teacher" className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gold-400 px-4 text-sm font-semibold text-navy-950 transition hover:bg-gold-300">
                Continue with demo access
              </Link>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
