'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import Noise from '@/components/ui/noise';
import { AlertTriangle } from 'lucide-react';

interface TeacherErrorProps {
  error?: Error;
  reset?: () => void;
}

export default function TeacherErrorPage({ error, reset }: TeacherErrorProps) {
  return (
    <AppShell active="" role="teacher">
      <div className="relative min-h-screen bg-navy-950 overflow-hidden">
        <Noise patternAlpha={8} patternRefreshInterval={3} />

        <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold-400/20 to-gold-300/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 mx-auto rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
                <AlertTriangle className="size-10 text-gold-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl font-black text-gold-400">Error</h1>
              <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
              <p className="text-ivory-200/70">
                An error occurred while loading this page.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {reset && (
                <button
                  onClick={reset}
                  className="h-11 rounded-lg bg-gold-400 text-navy-950 font-semibold hover:bg-gold-300 transition"
                >
                  Try Again
                </button>
              )}
              <Link
                href="/teacher"
                className="h-11 rounded-lg border border-gold-400/30 bg-white/5 text-white font-semibold hover:bg-white/10 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
