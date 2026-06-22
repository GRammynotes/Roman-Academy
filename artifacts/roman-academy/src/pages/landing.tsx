import { useState } from "react";
import { Link } from "wouter";
import { BookOpen, Target, Users, MapPin, X, Star, ChevronRight, GraduationCap, Trophy, Phone, Mail, Clock } from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";
import GradientText from "@/components/react-bits/GradientText";
import ShapeGrid from "@/components/react-bits/ShapeGrid";
import ScrollFloat from "@/components/react-bits/ScrollFloat";
import PixelCard from "@/components/react-bits/PixelCard";

const ACADEMY = {
  tagline: "Your Success, Our Mission.",
  taglineHindi: "शिक्षा ही शक्ति है",
  subtitle: "Personal mentorship, board preparation, and rigorous CET training — designed to bring out the best in every student.",
  address1: "A/2, Room 501/502, Sector-20, Turbhe, Navi Mumbai 400703\n(Near Turbhe Railway Station)",
  address2: "A1, 64/B, Sector-21, Turbhe, Navi Mumbai\n(Near ICL School & Mayuresh Hospital, 2nd Floor)",
  hours: "Mon–Sat: 9 AM – 8 PM  |  Sun: 10 AM – 7 PM",
  contacts: [
    { name: "Nava Dada", role: "Director", phone: "+91 80977 24133" },
    { name: "Abhi Dada", role: "Head of Academics", phone: "+91 90969 85169" },
    { name: "Kunal Datkhile", role: "Contact / Enquiry", phone: "+91 91727 65002", email: "Datkhilekunalvijay@gmail.com" },
  ],
};

const TEACHERS = [
  { name: "Abhijeet Roman", title: "Civil Engineer", role: "Core Subjects & Mentorship", exp: "10–12+ years", expertise: "PCB, Commerce Core, Languages" },
  { name: "Navnath Roman", title: "Electronic Engineer", role: "Math & Physics Expert", exp: "15 years", expertise: "Maths, Organic Chem, Electronics" },
  { name: "Kunal Datkhile", title: "Computer Engineer · 97%ile CET", role: "PCM & Aptitude", exp: "2 years", expertise: "Cyber Security & AI enthusiast" },
  { name: "Rinki Yadav", title: "MSc Chemistry", role: "Chemistry Specialist", exp: "4 years", expertise: "Inorganic & Physical Chemistry" },
];

const FEATURES = [
  { icon: "👥", label: "Personal Attention", desc: "Small batches for individual focus" },
  { icon: "📖", label: "Concept Clarity", desc: "Deep understanding for long-term success" },
  { icon: "📊", label: "Smart Practice", desc: "Regular tests & performance tracking" },
  { icon: "🎯", label: "Exam Focused", desc: "Board + CET aligned preparation" },
  { icon: "🏆", label: "Proven Results", desc: "Guiding students to top ranks" },
];

const BATCHES = [
  {
    name: "11th Science 2026",
    sub: "Foundation & Core Concepts",
    badge: { label: "Filling Fast", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    points: [
      { Icon: Target,        text: "State Board Support" },
      { Icon: BookOpen,      text: "CET Focus (Physics, Chemistry, Maths)" },
      { Icon: GraduationCap, text: "Weekly Chapter Tests" },
      { Icon: Users,         text: "Limited 30-Seat Focus Batch" },
    ],
  },
  {
    name: "12th Science 2026",
    sub: "Board Excellence & CET Mastery",
    badge: { label: "Active", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    points: [
      { Icon: Target,        text: "HSC Board Intensive Prep" },
      { Icon: BookOpen,      text: "Rigorous CET Testing" },
      { Icon: GraduationCap, text: "Weekly, Monthly & Full-Length Mocks" },
      { Icon: Users,         text: "Personal Mentorship" },
    ],
  },
];

const GALLERY_ITEMS = [
  { id: 1, label: "Advanced Classroom Setup",  src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" },
  { id: 2, label: "Digital Smart Board",       src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" },
  { id: 3, label: "Exam Preparation",          src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" },
  { id: 4, label: "Student Picnic",            src: "https://images.unsplash.com/photo-1511632765486-a01c80cb8b4a?auto=format&fit=crop&q=80&w=800" },
  { id: 5, label: "Celebrations",              src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800" },
  { id: 6, label: "AC Facilities",             src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800" },
];

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(() => {
    const visited = typeof window !== "undefined" && localStorage.getItem("ra_visited_phase6");
    if (!visited) {
      if (typeof window !== "undefined") localStorage.setItem("ra_visited_phase6", "true");
      return true;
    }
    return false;
  });
  const [activeGallery, setActiveGallery] = useState<typeof GALLERY_ITEMS[0] | null>(null);

  return (
    <div className="min-h-screen bg-navy-950 scroll-smooth">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/90 border-b border-gold-400/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <RomanWordmark />
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-ivory-100/75">
            <a href="#home"    className="hover:text-gold-300 transition-colors">Home</a>
            <a href="#batches" className="hover:text-gold-300 transition-colors">Batches</a>
            <a href="#results" className="hover:text-gold-300 transition-colors">Results</a>
            <a href="#faculty" className="hover:text-gold-300 transition-colors">Faculty</a>
            <a href="#gallery" className="hover:text-gold-300 transition-colors">Gallery</a>
            <Link href="/contact" className="hover:text-gold-300 transition-colors">Contact</Link>
          </div>
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-gold-400 px-5 text-sm font-bold text-navy-950 transition hover:bg-gold-300 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden min-h-[92vh] flex flex-col">
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(160deg, #050B1A 0%, #0A1628 55%, #152952 100%)" }} />
        <div className="absolute inset-0 z-0 opacity-70">
          <ShapeGrid direction="diagonal" speed={0.4} borderColor="rgba(212,175,55,0.12)" squareSize={48} hoverFillColor="rgba(212,175,55,0.06)" />
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(21,41,82,0.5) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-32 flex-1 flex items-center w-full">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center w-full">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-300 text-xs font-bold tracking-widest uppercase">
                <Star className="size-3.5" /> Admissions Open 2026
              </div>

              <div>
                <h1 className="leading-none">
                  <GradientText colors={["#D4AF37","#F3D27A","#fff3a0","#B8962E","#D4AF37"]} animationSpeed={5} className="text-6xl md:text-7xl font-black tracking-tight">
                    ROMAN
                  </GradientText>
                  <span className="block text-white font-extrabold tracking-[0.15em] text-3xl md:text-4xl mt-1">ACADEMY</span>
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className="h-px flex-1 max-w-12 bg-gold-400/40" />
                  <p className="text-gold-300/90 text-sm font-bold tracking-[0.22em]">11TH · 12TH · CET</p>
                  <span className="h-px flex-1 max-w-12 bg-gold-400/40" />
                </div>
              </div>

              <ScrollFloat delay={0.1}>
                <p className="text-xs md:text-sm text-ivory-100/55 font-semibold tracking-[0.15em] uppercase">
                  PERSONAL TUITION · CONCEPT FOCUSED · RESULT DRIVEN
                </p>
              </ScrollFloat>

              <ScrollFloat delay={0.2}>
                <p className="text-base md:text-lg italic text-gold-300/80 font-semibold">{ACADEMY.tagline}</p>
                <p className="text-ivory-100/65 max-w-md leading-relaxed text-sm mt-2">{ACADEMY.subtitle}</p>
              </ScrollFloat>

              <ScrollFloat delay={0.3}>
                <div className="flex items-center gap-4 flex-wrap pt-1">
                  <Link href="/contact?reason=Admission+Enquiry"
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-gold-400 px-8 text-sm font-bold text-navy-950 transition-all hover:bg-gold-300 hover:scale-105 active:scale-95 shadow-[0_4px_24px_rgba(212,175,55,0.4)]">
                    Enquire Now <ChevronRight className="ml-1 size-4" />
                  </Link>
                  <a href="#batches"
                    className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gold-400/40 bg-white/5 px-8 text-sm font-bold text-white transition-all hover:border-gold-400/70 hover:bg-white/10">
                    View Batches
                  </a>
                </div>
              </ScrollFloat>
            </div>

            <div className="hidden md:flex flex-col items-center gap-4">
              <div className="rounded-2xl border-2 border-gold-400/25 bg-navy-900/70 backdrop-blur-sm p-6 space-y-4 w-full shadow-2xl shadow-navy-950/60">
                <div className="text-center space-y-1.5 border-b border-gold-400/20 pb-4">
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-widest">Strong Concepts</p>
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-widest">Smart Practice</p>
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-widest">Top Results</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[["Physics","⚡"],["Chemistry","🧪"],["Maths","📐"]].map(([sub, icon]) => (
                    <div key={sub} className="p-3 rounded-xl bg-gold-400/5 border border-gold-400/15 hover:border-gold-400/35 transition-colors">
                      <p className="text-2xl">{icon}</p>
                      <p className="text-xs font-bold text-white mt-1.5">{sub}</p>
                    </div>
                  ))}
                </div>
                <Link href="/contact?reason=Admission+Enquiry"
                  className="block text-center py-2 text-xs font-bold text-navy-950 bg-gold-400 rounded-lg hover:bg-gold-300 transition-colors">
                  Enquire Now →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-gold-400/10 bg-navy-950/80 backdrop-blur-md px-4 py-5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-2.5">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gold-300 uppercase tracking-wider">{f.label}</p>
                  <p className="text-xs text-ivory-100/45">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Batches */}
      <section id="batches" className="px-4 py-20 border-y border-gold-400/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          <ScrollFloat>
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                <GradientText colors={["#D4AF37","#F3D27A","#D4AF37"]} animationSpeed={10} className="text-3xl md:text-4xl font-bold">Our Courses</GradientText>
              </h2>
              <p className="text-ivory-100/60 max-w-xl mx-auto">Structured curriculum with dedicated CET preparation and board focus.</p>
            </div>
          </ScrollFloat>
          <div className="grid md:grid-cols-2 gap-6">
            {BATCHES.map((b, i) => (
              <ScrollFloat key={b.name} delay={i * 0.1}>
                <div className="relative rounded-2xl border border-gold-400/20 bg-navy-950 overflow-hidden shadow-xl p-8 space-y-6 hover:border-gold-400/40 transition-colors"
                  style={{ backgroundImage: "linear-gradient(135deg, rgba(21,41,82,0.6) 0%, rgba(5,11,26,1) 100%)" }}>
                  <div className="absolute top-4 right-4">
                    <span className={`border text-xs font-bold px-2 py-1 rounded-md ${b.badge.cls}`}>{b.badge.label}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gold-300">{b.name}</h3>
                    <p className="text-sm text-ivory-100/50 mt-1">{b.sub}</p>
                  </div>
                  <ul className="space-y-3 text-sm font-medium text-ivory-100/80">
                    {b.points.map(({ Icon, text }) => (
                      <li key={text} className="flex items-start gap-3">
                        <Icon className="size-5 text-gold-400 shrink-0" /> {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollFloat>
            ))}
          </div>
          <div className="text-center text-sm font-semibold text-ivory-100/50 bg-gold-400/5 border border-gold-400/10 p-4 rounded-xl">
            Personalized mentorship · Small batches · Board + CET aligned curriculum
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="results" className="px-4 py-20 max-w-6xl mx-auto space-y-12">
        <ScrollFloat>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-widest"><Trophy className="size-4" /> Our Shining Stars</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">SSC 2026 Results</h2>
            <p className="text-ivory-100/60 max-w-xl mx-auto">Proud of every student who made us and their families beam with joy.</p>
          </div>
        </ScrollFloat>
        <ScrollFloat delay={0.1}>
          <div className="rounded-2xl overflow-hidden border border-gold-400/20 shadow-2xl" style={{ background: "linear-gradient(135deg, #0A1628 0%, #050B1A 100%)" }}>
            <img src="/academy/ssc-results-2026.jpg" alt="Roman Academy SSC 2026 Results" className="w-full object-contain max-h-[70vh]" />
          </div>
        </ScrollFloat>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[["93.20%","Top Score – Vaishnav Jagtap"],["21+","Students Above 80%"],["5+","School Toppers"],["100%","Students Passed"]].map(([value, label], i) => (
            <ScrollFloat key={label} delay={i * 0.07}>
              <div className="p-5 rounded-xl border border-gold-400/15 bg-navy-900/50 hover:border-gold-400/35 transition-colors">
                <p className="text-2xl md:text-3xl font-extrabold text-gold-300">{value}</p>
                <p className="text-xs text-ivory-100/60 mt-1">{label}</p>
              </div>
            </ScrollFloat>
          ))}
        </div>
      </section>

      {/* Faculty */}
      <section id="faculty" className="px-4 py-20 bg-navy-900/40 border-t border-gold-400/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <ScrollFloat>
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Meet Our Faculty</h2>
              <p className="text-ivory-100/60 max-w-xl mx-auto">Learn from experienced engineers, top percentile scorers, and dedicated educators.</p>
            </div>
          </ScrollFloat>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEACHERS.map((t, i) => (
              <ScrollFloat key={t.name} delay={i * 0.08}>
                <PixelCard variant="gold" className="w-full h-52">
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 space-y-2 pointer-events-none">
                    <div className="w-10 h-10 bg-gold-400/15 rounded-xl flex items-center justify-center border border-gold-400/25 mb-1">
                      <span className="text-gold-300 font-bold text-lg">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{t.name}</h3>
                      <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mt-0.5">{t.title}</p>
                    </div>
                    <div className="space-y-0.5 pt-1 border-t border-gold-400/15">
                      <p className="text-xs font-semibold text-ivory-100/90">{t.role}</p>
                      <p className="text-xs text-ivory-100/55">{t.expertise}</p>
                      <p className="text-xs text-gold-300/80 font-semibold">{t.exp} exp</p>
                    </div>
                  </div>
                </PixelCard>
              </ScrollFloat>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="px-4 py-20 border-t border-gold-400/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <ScrollFloat>
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Academy Gallery</h2>
              <p className="text-ivory-100/60 max-w-xl mx-auto">A glimpse into our facilities and vibrant student life.</p>
            </div>
          </ScrollFloat>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {GALLERY_ITEMS.map((item, i) => (
              <ScrollFloat key={item.id} delay={i * 0.05}>
                <div onClick={() => setActiveGallery(item)}
                  className="group relative aspect-video bg-navy-950 rounded-xl overflow-hidden cursor-pointer border border-gold-400/10 hover:border-gold-400/40 transition-all">
                  <img src={item.src} alt={item.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <p className="text-white text-xs md:text-sm font-bold truncate">{item.label}</p>
                  </div>
                </div>
              </ScrollFloat>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-4 py-16 bg-navy-900/60 border-t border-gold-400/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <RomanWordmark />
            <p className="text-xs italic text-gold-300/70">{ACADEMY.taglineHindi}</p>
            <p className="text-sm text-ivory-100/50 leading-relaxed">{ACADEMY.tagline}<br />11th &amp; 12th Science · Board + CET · Navi Mumbai</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Contact</p>
            {ACADEMY.contacts.map(c => (
              <div key={c.name}>
                <p className="text-sm font-semibold text-white">{c.name}</p>
                <p className="text-xs text-gold-300/70">{c.role}</p>
                <a href={`tel:${c.phone.replace(/\s/g,"")}`} className="text-xs text-ivory-100/60 hover:text-gold-300 transition-colors flex items-center gap-1 mt-0.5"><Phone className="size-3" />{c.phone}</a>
                {c.email && <a href={`mailto:${c.email}`} className="text-xs text-ivory-100/60 hover:text-gold-300 transition-colors flex items-center gap-1"><Mail className="size-3" />{c.email}</a>}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Visit Us</p>
            {[ACADEMY.address1, ACADEMY.address2].map((addr, i) => (
              <div key={i} className="flex items-start gap-2">
                <MapPin className="size-4 text-gold-400 shrink-0 mt-0.5" />
                <p className="text-xs text-ivory-100/60 whitespace-pre-line">{addr}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <Clock className="size-4 text-gold-400 shrink-0" />
              <p className="text-xs text-ivory-100/60">{ACADEMY.hours}</p>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-gold-400/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
          <p className="text-sm text-ivory-100/40">© 2026 Roman Academy. All rights reserved.</p>
          <Link href="/login" className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-semibold">Student Login →</Link>
        </div>
      </section>

      {activeGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button onClick={() => setActiveGallery(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="size-6" /></button>
          <div className="w-full max-w-5xl">
            <img src={activeGallery.src} alt={activeGallery.label} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            <p className="text-center text-white font-bold mt-4 text-lg">{activeGallery.label}</p>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-navy-950 border border-gold-400/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" style={{ backgroundImage: "linear-gradient(135deg, #0A1628 0%, #050B1A 100%)" }}>
            <div className="relative bg-gold-400/10 p-6 text-center border-b border-gold-400/20">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Roman Academy</h2>
              <p className="text-sm text-gold-300 mt-1 font-semibold italic">{ACADEMY.tagline}</p>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-ivory-100/80 leading-relaxed text-center">Premium 11th &amp; 12th Science coaching with focus on State Boards and CET.</p>
              <div className="rounded-xl border border-gold-400/15 bg-white/5 p-4">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">2026 Admissions</p>
                <ul className="text-sm font-medium text-white space-y-1.5">
                  <li className="flex items-center gap-2"><ChevronRight className="size-3.5 text-gold-400" /> 11th Science 2026 (Foundation)</li>
                  <li className="flex items-center gap-2"><ChevronRight className="size-3.5 text-gold-400" /> 12th Science 2026 (Boards + CET)</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/contact?reason=Admission+Enquiry" onClick={() => setShowPopup(false)}
                  className="block text-center py-3 bg-gold-400 text-navy-950 font-bold rounded-xl hover:bg-gold-300 transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.25)]">
                  Enquire About Admissions
                </Link>
                <button onClick={() => setShowPopup(false)} className="text-sm text-ivory-100/50 hover:text-ivory-100/80 transition-colors">Explore the website first</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
