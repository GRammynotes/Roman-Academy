"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RomanWordmark } from "@/components/roman-wordmark";
import Noise from "@/components/ui/noise";
import { MapPin, Phone, Mail, Clock, Send, ChevronLeft } from "lucide-react";
import { Suspense } from "react";

function ContactForm() {
  const searchParams = useSearchParams();
  const defaultReason = searchParams.get("reason") || "";

  return (
    <div className="bg-white dark:bg-navy-900 border border-gold-400/20 p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
      
      <form 
        className="space-y-4" 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const name = formData.get("name");
          const phone = formData.get("phone");
          const reason = formData.get("reason");
          const message = formData.get("message");
          
          const waMessage = `*New Contact Enquiry*%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Reason:* ${reason}%0A*Message:* ${message}`;
          window.open(`https://wa.me/918097724133?text=${waMessage}`, "_blank");
        }}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-2 block text-sm font-semibold text-gray-700 dark:text-ivory-100/80">
            <span>Full Name</span>
            <input 
              name="name"
              required
              className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-navy-950/80 backdrop-blur-sm border border-gold-400/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-ivory-100/40 focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all"
              placeholder="John Doe"
            />
          </label>
          
          <label className="space-y-2 block text-sm font-semibold text-gray-700 dark:text-ivory-100/80">
            <span>Phone Number</span>
            <input 
              name="phone"
              required
              type="tel"
              className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-navy-950/80 backdrop-blur-sm border border-gold-400/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-ivory-100/40 focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all"
              placeholder="+91 98765 43210"
            />
          </label>
        </div>

        <label className="space-y-2 block text-sm font-semibold text-ivory-100/80">
          <span>Reason for Contact</span>
          <select 
            name="reason"
            defaultValue={defaultReason}
            required
            className="w-full h-11 px-4 rounded-lg bg-navy-950/80 backdrop-blur-sm border border-gold-400/20 text-white focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all"
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
            name="message"
            required
            className="w-full h-32 p-4 rounded-lg bg-navy-950/80 backdrop-blur-sm border border-gold-400/20 text-white placeholder-ivory-100/40 focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all resize-none"
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
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      <Noise patternAlpha={8} patternRefreshInterval={3} />
      
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-gold-400/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <RomanWordmark compact={true} />
          
          <Link href="/" className="inline-flex h-9 items-center justify-center rounded-lg border border-gold-400/20 px-4 text-sm font-semibold text-ivory-100 transition hover:bg-white/10">
            <ChevronLeft className="mr-1 size-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 px-4 py-16 md:py-24 max-w-6xl mx-auto">
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
                  <p className="font-bold text-white text-lg">Roman Academy - Main Branch</p>
                  <p className="text-ivory-100/70 mt-1 leading-relaxed">
                    A/2, Room 501/502, Sector-20<br />
                    Turbhe, Navi Mumbai - 400703<br />
                    Near Turbhe Railway Station
                  </p>
                  <p className="font-bold text-white text-sm mt-3">Branch 2</p>
                  <p className="text-ivory-100/70 mt-1 leading-relaxed">
                    A1, 64/B, Sector-21, Turbhe<br />
                    Near ICL School & Mayuresh Hospital<br />
                    2nd Floor, Navi Mumbai
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shrink-0">
                  <Phone className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Admissions Helpline</p>
                  <div className="text-ivory-100/70 mt-1 space-y-1">
                    <p><span className="font-semibold">Nava Dada:</span> +91 8097724133</p>
                    <p><span className="font-semibold">Abhi Dada:</span> +91 9096985169</p>
                    <p><span className="font-semibold">Kunal Datkhile:</span> +91 9172765002</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shrink-0">
                  <Mail className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Email</p>
                  <p className="text-ivory-100/70 mt-1">contact@romanacademy.in</p>
                  <p className="text-ivory-100/70 mt-1">Datkhilekunalvijay@gmail.com</p>
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
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gold-400/10 bg-white/5">
                  <p className="font-bold text-white">Nava Dada</p>
                  <p className="text-xs text-gold-400 mt-1">Director</p>
                  <p className="text-sm text-ivory-100/70 mt-2">8097724133</p>
                </div>
                <div className="p-4 rounded-xl border border-gold-400/10 bg-white/5">
                  <p className="font-bold text-white">Abhi Dada</p>
                  <p className="text-xs text-gold-400 mt-1">Head of Academics</p>
                  <p className="text-sm text-ivory-100/70 mt-2">9096985169</p>
                </div>
                <div className="p-4 rounded-xl border border-gold-400/10 bg-white/5">
                  <p className="font-bold text-white">Kunal Datkhile</p>
                  <p className="text-xs text-gold-400 mt-1">Admissions & Technical</p>
                  <p className="text-sm text-ivory-100/70 mt-2">9172765002</p>
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
