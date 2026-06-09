"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RomanWordmark } from "@/components/roman-wordmark";
import { MapPin, Phone, Mail, Clock, Send, ChevronLeft } from "lucide-react";
import { Suspense } from "react";

function ContactForm() {
  const searchParams = useSearchParams();
  const defaultReason = searchParams.get("reason") || "";

  return (
    <div className="bg-navy-900 border border-gold-400/20 p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-2 block text-sm font-semibold text-ivory-100/80">
            <span>Full Name</span>
            <input 
              required
              className="w-full h-11 px-4 rounded-lg bg-navy-950 border border-gold-400/20 text-white placeholder-ivory-100/40 focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all"
              placeholder="John Doe"
            />
          </label>
          
          <label className="space-y-2 block text-sm font-semibold text-ivory-100/80">
            <span>Phone Number</span>
            <input 
              required
              type="tel"
              className="w-full h-11 px-4 rounded-lg bg-navy-950 border border-gold-400/20 text-white placeholder-ivory-100/40 focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all"
              placeholder="+91 98765 43210"
            />
          </label>
        </div>

        <label className="space-y-2 block text-sm font-semibold text-ivory-100/80">
          <span>Reason for Contact</span>
          <select 
            defaultValue={defaultReason}
            required
            className="w-full h-11 px-4 rounded-lg bg-navy-950 border border-gold-400/20 text-white focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all"
          >
            <option value="" disabled>Select a reason...</option>
            <option value="Admission Enquiry">Admission Enquiry</option>
            <option value="Batch Timing">Batch Timings</option>
            <option value="Fees Structure">Fees Structure</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="space-y-2 block text-sm font-semibold text-ivory-100/80">
          <span>Message</span>
          <textarea 
            required
            className="w-full h-32 p-4 rounded-lg bg-navy-950 border border-gold-400/20 text-white placeholder-ivory-100/40 focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all resize-none"
            placeholder="How can we help you?"
          />
        </label>

        <button 
          type="submit"
          className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gold-400 text-navy-950 font-bold hover:bg-gold-300 transition-colors mt-2"
        >
          <Send className="size-4" /> Send Enquiry
        </button>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-gold-400/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <RomanWordmark />
          
          <Link href="/" className="inline-flex h-9 items-center justify-center rounded-lg border border-gold-400/20 px-4 text-sm font-semibold text-ivory-100 transition hover:bg-white/10">
            <ChevronLeft className="mr-1 size-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Get in Touch</h1>
          <p className="text-lg text-ivory-100/70 max-w-2xl mx-auto">
            Have questions about admissions, batches, or our teaching methodology? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          
          {/* Contact Details Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gold-300">Academy Details</h2>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shrink-0">
                  <MapPin className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Roman Academy</p>
                  <p className="text-ivory-100/70 mt-1 leading-relaxed">
                    Pune, Maharashtra<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shrink-0">
                  <Phone className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Admissions Helpline</p>
                  <p className="text-ivory-100/70 mt-1">+91 917276 5002</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shrink-0">
                  <Mail className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Email</p>
                  <p className="text-ivory-100/70 mt-1">contact@romanacademy.in</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shrink-0">
                  <Clock className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Working Hours</p>
                  <p className="text-ivory-100/70 mt-1">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gold-400/10">
              <h3 className="text-lg font-bold text-white mb-4">Key Contacts</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gold-400/10 bg-white/5">
                  <p className="font-bold text-white">Abhijeet Roman</p>
                  <p className="text-xs text-gold-400 mt-1">Director & Core Mentor</p>
                </div>
                <div className="p-4 rounded-xl border border-gold-400/10 bg-white/5">
                  <p className="font-bold text-white">Navnath Roman</p>
                  <p className="text-xs text-gold-400 mt-1">Head of Academics</p>
                </div>
                <div className="p-4 rounded-xl border border-gold-400/10 bg-white/5 sm:col-span-2">
                  <p className="font-bold text-white">Kunal Datkhile</p>
                  <p className="text-xs text-gold-400 mt-1">Admissions & Technical</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <Suspense fallback={<div className="h-96 rounded-2xl border border-gold-400/20 animate-pulse bg-navy-900" />}>
            <ContactForm />
          </Suspense>

        </div>
      </main>
    </div>
  );
}
