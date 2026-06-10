"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  MapPin,
  Phone,
  Target,
  Trophy,
  Users
} from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";

const strengths = [
  {
    title: "Personal Attention",
    detail: "Small batches for individual focus",
    icon: Users
  },
  {
    title: "Concept Clarity",
    detail: "Deep understanding for long-term success",
    icon: BookOpen
  },
  {
    title: "Smart Practice",
    detail: "Regular tests and performance tracking",
    icon: Target
  },
  {
    title: "Exam Focused",
    detail: "Board and CET aligned preparation",
    icon: GraduationCap
  },
  {
    title: "Proven Results",
    detail: "Guiding students to top ranks",
    icon: Trophy
  }
];

const courses = [
  {
    title: "Science",
    subtitle: "11th | 12th | CET",
    detail: "PCM / PCB"
  },
  {
    title: "Commerce",
    subtitle: "11th | 12th | CET",
    detail: "BBA / BMS Entrance"
  },
  {
    title: "NEET Foundation",
    subtitle: "Class 11 & 12",
    detail: "Aspirant-focused preparation"
  }
];

const contacts = [
  { name: "Nava Dada", phone: "8097724133" },
  { name: "Abhi Dada", phone: "9096985169" },
  { name: "Kunal Datkhile", phone: "9172765002" }
];

const addresses = [
  "A/2, Room 501/502, Sector-20, Turbhe, Near Turbhe Railway Station",
  "A1, 64/8, Sector-21, Turbhe, Near ICL School & Mayuresh Hospital, 2nd Floor"
];

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const visited = typeof window !== "undefined" && window.localStorage?.getItem("ra_visited_brochure_page_1");
    if (!visited) {
      const timer = window.setTimeout(() => setShowPopup(true), 1200);
      window.localStorage?.setItem("ra_visited_brochure_page_1", "true");
      return () => window.clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <nav className="sticky top-0 z-40 border-b border-gold-400/10 bg-navy-950/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <RomanWordmark compact />
          <div className="hidden items-center gap-8 text-sm font-semibold text-white/85 md:flex">
            <a href="#courses" className="transition-colors hover:text-gold-400">Courses</a>
            <a href="#why" className="transition-colors hover:text-gold-400">Why Roman</a>
            <a href="#contact" className="transition-colors hover:text-gold-400">Contact</a>
          </div>
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-gold-400 px-5 text-sm font-bold text-navy-950 transition hover:bg-gold-300">
            Portal Login
          </Link>
        </div>
      </nav>

      <main>
        <section id="home" className="border-b border-gold-400/10">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
            <div className="space-y-7">
              <RomanWordmark />
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest text-gold-400">
                  Personal tuition | Concept focused | Result driven
                </p>
                <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-white md:text-5xl">
                  For students aiming beyond limits.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/72">
                  Roman Academy provides focused coaching for Science, Commerce, CET, and NEET aspirants with small batches, concept clarity, smart practice, and exam-aligned preparation.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="#contact" className="inline-flex h-10 items-center justify-center rounded-lg bg-gold-400 px-6 text-sm font-bold text-navy-950 transition hover:bg-gold-300">
                  Contact Admissions <ChevronRight className="ml-1 size-4" />
                </a>
                <a href="#courses" className="inline-flex h-10 items-center justify-center rounded-lg border border-gold-400/30 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10">
                  View Courses
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {courses.map((course) => (
                  <div key={course.title} className="rounded-xl border border-gold-400/15 bg-navy-900 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold-400">{course.title}</p>
                    <p className="mt-2 text-sm font-bold text-white">{course.subtitle}</p>
                    <p className="mt-1 text-xs text-white/60">{course.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-gold-400/25 bg-navy-900 shadow-elite">
              <Image
                src="/roman-academy-brochure-page-1.png"
                alt="Roman Academy brochure first page"
                width={1080}
                height={1533}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section id="courses" className="border-b border-gold-400/10 bg-navy-900/40 px-4 py-14 md:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white">Our Courses</h2>
              <p className="text-sm text-white/60">From the Roman Academy brochure: Science, Commerce, and NEET Foundation tracks.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {courses.map((course) => (
                <div key={course.title} className="rounded-xl border border-gold-400/20 bg-navy-950 p-6">
                  <BookOpen className="size-8 text-gold-400" />
                  <h3 className="mt-5 text-2xl font-bold text-white">{course.title}</h3>
                  <p className="mt-2 text-sm font-bold uppercase tracking-wider text-gold-400">{course.subtitle}</p>
                  <p className="mt-3 text-sm leading-6 text-white/66">{course.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="px-4 py-14 md:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white">Why Roman Academy?</h2>
              <p className="text-sm text-white/60">The five promises shown on the first brochure page.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {strengths.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-gold-400/20 bg-navy-900 p-5 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full border border-gold-400/25 bg-gold-400/10">
                      <Icon className="size-5 text-gold-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/62">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-gold-400/10 bg-navy-900/40 px-4 py-14 md:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-white">Contact Us</h2>
              <p className="text-sm leading-6 text-white/68">
                Admissions and batch enquiries for Roman Academy, Turbhe, Navi Mumbai.
              </p>
              <div className="grid gap-3">
                {contacts.map((contact) => (
                  <a
                    key={contact.phone}
                    href={`tel:+91${contact.phone}`}
                    className="flex items-center justify-between rounded-xl border border-gold-400/15 bg-navy-950 p-4 transition hover:border-gold-400/35"
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{contact.name}</span>
                      <span className="text-xs text-white/58">+91 {contact.phone}</span>
                    </span>
                    <Phone className="size-4 text-gold-400" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gold-400/20 bg-navy-950 p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-gold-400" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-gold-400">Turbhe, Navi Mumbai</p>
                  <div className="mt-4 grid gap-4">
                    {addresses.map((address) => (
                      <p key={address} className="rounded-lg border border-gold-400/10 bg-navy-900 p-4 text-sm leading-6 text-white/72">
                        {address}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gold-400/10 bg-navy-950 px-4 py-8 text-center text-xs text-white/45">
        Roman Academy | 11th | 12th | CET
      </footer>

      {showPopup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gold-400/30 bg-navy-950 p-6 shadow-elite">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Admissions Open</p>
            <h2 className="mt-3 text-2xl font-bold text-white">For students aiming beyond limits.</h2>
            <p className="mt-3 text-sm leading-6 text-white/68">
              Science PCM/PCB, Commerce, CET, and NEET Foundation batches are open at Roman Academy.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-gold-400 text-sm font-bold text-navy-950 transition hover:bg-gold-300"
              >
                Explore
              </button>
              <Link
                href="/login"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-gold-400/30 text-sm font-bold text-white transition hover:bg-white/5"
              >
                Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
