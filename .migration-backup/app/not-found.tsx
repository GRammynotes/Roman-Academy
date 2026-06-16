'use client';

import Link from 'next/link';
import { RomanWordmark } from '@/components/roman-wordmark';
import Noise from '@/components/ui/noise';
import { Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex flex-col">
      <Noise patternAlpha={10} patternRefreshInterval={2} />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-gold-400/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <RomanWordmark compact={true} />
          <Link href="/" className="inline-flex h-9 items-center justify-center rounded-lg border border-gold-400/20 px-4 text-sm font-semibold text-ivory-100 transition hover:bg-white/10">
            <Home className="mr-1 size-4" /> Home
          </Link>
        </div>
      </nav>

      {/* 404 Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Search Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-400/20 to-gold-300/20 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 mx-auto rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
              <Search className="size-12 text-gold-400" />
            </div>
          </div>

          {/* 404 Message */}
          <div className="space-y-3">
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-400">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Page Not Found
            </h2>
            <p className="text-ivory-200/70 leading-relaxed">
              We couldn't find the page you're looking for. It may have been moved or deleted.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="pt-6 space-y-3">
            <Link
              href="/"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-8 text-sm font-bold text-navy-950 transition hover:bg-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              <Home className="size-4" /> Return to Home
            </Link>
            
            <Link
              href="/contact"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gold-400/30 bg-white/5 px-8 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Contact Support
            </Link>
          </div>

          {/* Popular Links */}
          <div className="pt-6 border-t border-gold-400/20">
            <p className="text-xs text-ivory-100/50 uppercase tracking-widest mb-4">Popular Pages</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className="text-sm text-gold-400 hover:text-gold-300 transition font-medium">Login</Link>
              <Link href="#batches" className="text-sm text-gold-400 hover:text-gold-300 transition font-medium">Batches</Link>
              <Link href="#faculty" className="text-sm text-gold-400 hover:text-gold-300 transition font-medium">Teachers</Link>
              <Link href="/contact" className="text-sm text-gold-400 hover:text-gold-300 transition font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
