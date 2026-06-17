"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RomanWordmark } from "@/components/roman-wordmark";
import { BookOpen, Target, Users, MapPin, Play, X, Star, ChevronRight, GraduationCap } from "lucide-react";

const TEACHERS = [
  {
    name: "Abhijeet Roman",
    role: "Core subjects & Mentorship",
    exp: "10–12+ years experience",
    expertise: "PCB, Commerce core, Languages",
    title: "Civil Engineer"
  },
  {
    name: "Navnath Roman",
    role: "Math & Physics Expert",
    exp: "15 years teaching experience",
    expertise: "Maths, Organic Chem, Electronics",
    title: "Electronic Engineer"
  },
  {
    name: "Kunal Datkhile",
    role: "PCM & Aptitude",
    exp: "2 years teaching experience",
    expertise: "Cyber security & AI enthusiast",
    title: "Computer Engineer • 97%ile CET"
  },
  {
    name: "Rinki Yadav",
    role: "Biology & Chemistry",
    exp: "4 years teaching experience",
    expertise: "NEET foundation",
    title: "500+ NEET score"
  }
];

const GALLERY_ITEMS = [
  { id: 1, type: "photo", label: "Advanced Classroom Setup", src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" },
  { id: 2, type: "photo", label: "Digital Smart Board", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" },
  { id: 3, type: "photo", label: "Exam Preparation", src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" },
  { id: 4, type: "photo", label: "Student Picnic", src: "https://images.unsplash.com/photo-1511632765486-a01c80cb8b4a?auto=format&fit=crop&q=80&w=800" },
  { id: 5, type: "video", label: "Celebrations", src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800" },
  { id: 6, type: "photo", label: "AC Facilities", src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800" }
];

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState<typeof GALLERY_ITEMS[0] | null>(null);

  useEffect(() => {
    const visited = localStorage.getItem("ra_visited_phase6");
    if (!visited) {
      setTimeout(() => setShowPopup(true), 1500);
      localStorage.setItem("ra_visited_phase6", "true");
    }
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 scroll-smooth" style={{
      backgroundImage: `
        radial-gradient(1000px 600px at 50% 0%, rgba(59, 130, 246, 0.05), transparent),
        radial-gradient(800px 400px at 100% 100%, rgba(212, 175, 55, 0.05), transparent)
      `
    }}>
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-gold-400/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <RomanWordmark />
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-ivory-100/80">
            <a href="#home" className="hover:text-gold-300 transition-colors">Home</a>
            <a href="#batches" className="hover:text-gold-300 transition-colors">Batches</a>
            <a href="#faculty" className="hover:text-gold-300 transition-colors">Teachers</a>
            <a href="#gallery" className="hover:text-gold-300 transition-colors">Gallery</a>
            <Link href="/contact" className="hover:text-gold-300 transition-colors">Contact</Link>
          </div>

          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-gold-400 px-5 text-sm font-bold text-navy-950 transition hover:bg-gold-300 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative px-4 py-20 md:py-32 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
        
        <div className="max-w-4xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-300 text-xs font-bold tracking-widest uppercase mb-4">
            <Star className="size-3.5" /> Admissions Open 2026
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Excellence in <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500">
              Science & CET
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-ivory-100/70 max-w-2xl mx-auto leading-relaxed">
            Personal mentorship, board preparation, and rigorous CET training—designed to bring out the best in every student.
          </p>

          <div className="pt-6 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/contact?reason=Admission+Enquiry" className="inline-flex h-12 items-center justify-center rounded-lg bg-gold-400 px-8 text-sm font-bold text-navy-950 transition hover:bg-gold-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              Enquire Now <ChevronRight className="ml-1 size-4" />
            </Link>
            <a href="#batches" className="inline-flex h-12 items-center justify-center rounded-lg border border-gold-400/30 bg-white/5 px-8 text-sm font-bold text-white transition hover:bg-white/10">
              View Batches
            </a>
          </div>
        </div>
      </section>

      {/* Batches Section */}
      <section id="batches" className="px-4 py-20 bg-navy-900/50 border-y border-gold-400/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Active Batches</h2>
            <p className="text-ivory-100/60 max-w-xl mx-auto">Structured curriculum focusing heavily on State Boards alongside dedicated CET preparation modules.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 11th Batch */}
            <div className="relative group rounded-2xl border border-gold-400/20 bg-navy-950 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-1 rounded-md">
                  Filling Fast
                </span>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gold-300">11th Science 2026</h3>
                  <p className="text-sm text-ivory-100/50 mt-1">Foundation & Core Concepts</p>
                </div>
                
                <ul className="space-y-3 text-sm font-medium text-ivory-100/80">
                  <li className="flex items-start gap-3"><Target className="size-5 text-gold-400 shrink-0" /> State Board Support</li>
                  <li className="flex items-start gap-3"><BookOpen className="size-5 text-gold-400 shrink-0" /> CET Focus (Physics, Chemistry, Maths)</li>
                  <li className="flex items-start gap-3"><GraduationCap className="size-5 text-gold-400 shrink-0" /> Weekly Chapter Tests</li>
                  <li className="flex items-start gap-3"><Users className="size-5 text-gold-400 shrink-0" /> Limited 30-Seat Focus Batch</li>
                </ul>
              </div>
            </div>

            {/* 12th Batch */}
            <div className="relative group rounded-2xl border border-gold-400/20 bg-navy-950 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2 py-1 rounded-md">
                  Active
                </span>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gold-300">12th Science 2026</h3>
                  <p className="text-sm text-ivory-100/50 mt-1">Board Excellence & CET Mastery</p>
                </div>
                
                <ul className="space-y-3 text-sm font-medium text-ivory-100/80">
                  <li className="flex items-start gap-3"><Target className="size-5 text-gold-400 shrink-0" /> HSC Board Intensive Prep</li>
                  <li className="flex items-start gap-3"><BookOpen className="size-5 text-gold-400 shrink-0" /> Rigorous CET Testing</li>
                  <li className="flex items-start gap-3"><GraduationCap className="size-5 text-gold-400 shrink-0" /> Weekly, Monthly & Full-Length Mocks</li>
                  <li className="flex items-start gap-3"><Users className="size-5 text-gold-400 shrink-0" /> Personal Mentorship</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm font-semibold text-ivory-100/50 bg-gold-400/5 border border-gold-400/10 p-4 rounded-xl">
            * Note: Commerce and NEET foundation streams are available as limited add-on batches. Contact us for details.
          </div>
        </div>
      </section>

      {/* Teachers / Faculty Section */}
      <section id="faculty" className="px-4 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">Meet Our Faculty</h2>
          <p className="text-ivory-100/60 max-w-xl mx-auto">Learn from experienced engineers, top percentile scorers, and dedicated educators.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEACHERS.map((teacher) => (
            <div key={teacher.name} className="flex flex-col bg-white/5 border border-gold-400/15 rounded-2xl overflow-hidden hover:border-gold-400/40 transition-colors">
              <div className="p-5 space-y-4">
                <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20">
                  <span className="text-gold-300 font-bold text-lg">{teacher.name.charAt(0)}</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-lg">{teacher.name}</h3>
                  <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mt-1">{teacher.title}</p>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gold-400/10">
                  <p className="text-sm font-medium text-ivory-100">{teacher.role}</p>
                  <p className="text-xs text-ivory-100/60">{teacher.expertise}</p>
                  <p className="text-xs text-gold-300/80 font-semibold">{teacher.exp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="px-4 py-20 bg-navy-900/50 border-t border-gold-400/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Academy Gallery</h2>
            <p className="text-ivory-100/60 max-w-xl mx-auto">A glimpse into our facilities and vibrant student life.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {GALLERY_ITEMS.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setActiveGalleryItem(item)}
                className="group relative aspect-video bg-navy-950 rounded-xl overflow-hidden cursor-pointer border border-gold-400/10 hover:border-gold-400/40 transition-all"
              >
                <img src={item.src} alt={item.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 md:p-4">
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Play className="size-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  <p className="text-white text-xs md:text-sm font-bold truncate z-10">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold-400/10 bg-navy-950 px-4 py-8 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <RomanWordmark />
          <p className="text-sm text-ivory-100/50">© 2026 Roman Academy. All rights reserved.</p>
        </div>
      </footer>

      {/* Gallery Lightbox Modal */}
      {activeGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button 
            onClick={() => setActiveGalleryItem(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="size-6" />
          </button>
          
          <div className="w-full max-w-5xl">
            <img 
              src={activeGalleryItem.src} 
              alt={activeGalleryItem.label} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-center text-white font-bold mt-4 text-lg">{activeGalleryItem.label}</p>
          </div>
        </div>
      )}

      {/* First-load Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-navy-950 border border-gold-400/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gold-400/10 p-6 text-center border-b border-gold-400/20">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Roman Academy</h2>
              <p className="text-sm text-gold-300 mt-1 font-medium">Your Success, Our Mission.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-sm text-ivory-100/80 leading-relaxed text-center">
                We provide premium 11th & 12th Science coaching with a dedicated focus on State Boards and CET preparation.
              </p>
              
              <div className="rounded-xl border border-gold-400/15 bg-white/5 p-4">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">2026 Admissions</p>
                <ul className="text-sm font-medium text-white space-y-1.5">
                  <li className="flex items-center gap-2"><ChevronRight className="size-3.5 text-gold-400"/> 11th Science 2026 (Foundation)</li>
                  <li className="flex items-center gap-2"><ChevronRight className="size-3.5 text-gold-400"/> 12th Science 2026 (Boards + CET)</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Link 
                  href="/contact?reason=Admission+Enquiry"
                  className="w-full h-12 flex items-center justify-center rounded-lg bg-gold-400 font-bold text-navy-950 transition hover:bg-gold-300 shadow-md"
                >
                  Start Enquiry
                </Link>
                <Link 
                  href="/login"
                  className="w-full h-12 flex items-center justify-center rounded-lg border border-gold-400/30 bg-transparent font-bold text-white transition hover:bg-white/5"
                >
                  Login to Dashboard
                </Link>
              </div>
            </div>
            
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/70 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
