import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";
import Noise from "@/components/react-bits/Noise";

const ACADEMY = {
  tagline: "Your Success, Our Mission.",
  address1: "A/2, Room 501/502, Sector-20, Turbhe, Navi Mumbai 400703\n(Near Turbhe Railway Station)",
  address2: "A1, 64/B, Sector-21, Turbhe, Navi Mumbai\n(Near ICL School & Mayuresh Hospital, 2nd Floor)",
  hours: "Mon–Sat: 9 AM – 8 PM  |  Sun: 10 AM – 7 PM",
  contacts: [
    { name: "Nava Dada", role: "Director", phone: "+91 80977 24133" },
    { name: "Abhi Dada", role: "Head of Academics", phone: "+91 90969 85169" },
    { name: "Kunal Datkhile", role: "Contact / Enquiry", phone: "+91 91727 65002", email: "Datkhilekunalvijay@gmail.com" },
  ],
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = `Hello Roman Academy,\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    window.open(`https://wa.me/918097724133?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      <Noise patternAlpha={14} patternRefreshInterval={3} />

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(212,175,55,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(21,41,82,0.6) 0%, transparent 60%)" }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/90 border-b border-gold-400/10">
        <div className="mx-auto max-w-5xl px-4 md:px-8 h-14 flex items-center justify-between">
          <Link href="/"><RomanWordmark /></Link>
          <Link href="/login" className="inline-flex h-8 items-center justify-center rounded-lg bg-gold-400 px-4 text-xs font-bold text-navy-950 transition hover:bg-gold-300">Login</Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-widest">Get In Touch</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Contact Roman Academy</h1>
          <p className="text-ivory-100/60 max-w-lg mx-auto">Have questions about admissions or our programs? We're here to help.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gold-400/20 bg-navy-900/60 backdrop-blur-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Contact Details</h2>
              <div className="space-y-4">
                {ACADEMY.contacts.map(c => (
                  <div key={c.name} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-gold-400/10">
                    <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
                      <span className="text-gold-400 font-bold text-sm">{c.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{c.name}</p>
                      <p className="text-xs text-gold-400/80">{c.role}</p>
                      <a href={`tel:${c.phone.replace(/\s/g,"")}`} className="text-xs text-ivory-100/60 hover:text-gold-300 flex items-center gap-1 mt-0.5 transition-colors">
                        <Phone className="size-3" />{c.phone}
                      </a>
                      {c.email && <a href={`mailto:${c.email}`} className="text-xs text-ivory-100/60 hover:text-gold-300 flex items-center gap-1 transition-colors"><Mail className="size-3" />{c.email}</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gold-400/20 bg-navy-900/60 backdrop-blur-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Locations</h2>
              {[ACADEMY.address1, ACADEMY.address2].map((addr, i) => (
                <div key={i} className="flex gap-2 p-3 rounded-xl bg-white/5 border border-gold-400/10">
                  <MapPin className="size-4 text-gold-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-ivory-100/70 whitespace-pre-line leading-relaxed">{addr}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-gold-400/10">
                <Clock className="size-4 text-gold-400 shrink-0" />
                <p className="text-xs text-ivory-100/70">{ACADEMY.hours}</p>
              </div>
            </div>
          </div>

          {/* Enquiry form */}
          <div className="rounded-2xl border border-gold-400/20 bg-navy-900/60 backdrop-blur-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Send Enquiry</h2>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="text-4xl">✅</div>
                <p className="text-white font-bold">WhatsApp opened!</p>
                <p className="text-sm text-ivory-100/60">Send the pre-filled message to connect with us directly.</p>
                <button onClick={() => setSubmitted(false)} className="text-xs text-gold-400 hover:text-gold-300 transition-colors">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ivory-100/60 mb-1.5 uppercase tracking-wider">Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required
                    className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-950/60 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ivory-100/60 mb-1.5 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required
                    className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-950/60 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ivory-100/60 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="E.g. I'm interested in 11th Science batch 2026..." rows={4} required
                    className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-950/60 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:outline-none transition-all text-sm resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-3 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.3)] text-sm">
                  Send via WhatsApp <ArrowRight className="size-4" />
                </button>
                <p className="text-xs text-ivory-100/35 text-center">Opens WhatsApp with your message pre-filled.</p>
              </form>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">← Back to Roman Academy</Link>
        </div>
      </div>
    </div>
  );
}
