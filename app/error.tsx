'use client';

import Link from 'next/link';
import { RomanWordmark } from '@/components/roman-wordmark';
import Noise from '@/components/ui/noise';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  error?: Error;
  reset?: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const is404 = error?.message?.includes('404');
  const errorCode = is404 ? '404' : '500';
  const errorTitle = is404 ? 'Page Not Found' : 'Internal Server Error';
  const errorMessage = is404 
    ? 'The page you are looking for doesn\'t exist or has been moved.'
    : 'Something went wrong on our end. Please try again later.';

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex flex-col">
      <Noise patternAlpha={10} patternRefreshInterval={2} />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-gold-400/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <RomanWordmark compact={true} />
          <Link href="/" className="inline-flex h-9 items-center justify-center rounded-lg border border-gold-400/20 px-4 text-sm font-semibold text-ivory-100 transition hover:bg-white/10">
            <Home className="mr-1 size-4" /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Error Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-400/20 to-gold-300/20 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 mx-auto rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
              <AlertCircle className="size-12 text-gold-400" />
            </div>
          </div>

          {/* Error Code */}
          <div className="space-y-3">
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-400">
              {errorCode}
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {errorTitle}
            </h2>
            <p className="text-ivory-200/70 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gold-400 px-8 text-sm font-bold text-navy-950 transition hover:bg-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              <Home className="size-4" /> Back to Home
            </Link>
            
            {reset && (
              <button
                onClick={reset}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gold-400/30 bg-white/5 px-8 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <ArrowLeft className="size-4" /> Try Again
              </button>
            )}
          </div>

          {/* Additional Help */}
          <div className="pt-6 border-t border-gold-400/20 space-y-3">
            <p className="text-sm text-ivory-100/60">
              Having trouble? Contact us at{' '}
              <Link href="/contact" className="text-gold-400 hover:text-gold-300 font-semibold transition">
                contact@romanacademy.in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
