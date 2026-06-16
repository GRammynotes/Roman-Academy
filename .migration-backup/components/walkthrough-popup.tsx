"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Stepper, { Step } from "@/components/ui/stepper";
import BorderGlow from "@/components/ui/border-glow";

interface WalkthroughPopupProps {
  onClose?: () => void;
}

export function WalkthroughPopup({ onClose }: WalkthroughPopupProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4 backdrop-blur-sm">
      <BorderGlow
        className="w-full max-w-2xl"
        glowColor="40 80 80"
        backgroundColor="#0F1A2E"
        borderRadius={16}
        colors={["#D4AF37", "#F7E7A1", "#0A2342"]}
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold-400">First Login</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-ivory-50">
                Welcome to Roman Academy
              </h2>
            </div>
            <button
              aria-label="Close walkthrough"
              className="rounded-lg p-2 text-ivory-200 hover:bg-navy-900/30 transition-colors"
              onClick={handleClose}
            >
              <X className="size-5" />
            </button>
          </div>

          <Stepper
            onComplete={handleClose}
            disableIndicators={false}
          >
            <Step title="Batches & Streams">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-ivory-50">
                  Batches & Streams
                </h3>
                <p className="text-ivory-200/80 leading-relaxed">
                  Track your main class syllabus separately from any alternate CET lecture stream. Each batch is customized with its own schedule and progress tracking.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-gold-400/10 border border-gold-400/30">
                  <p className="text-sm text-gold-300">
                    💡 Tip: Your teachers manage batches and assign you to the right one during enrollment.
                  </p>
                </div>
              </div>
            </Step>

            <Step title="Your Progress">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-ivory-50">
                  Track Your Progress
                </h3>
                <p className="text-ivory-200/80 leading-relaxed">
                  Your profile shows one progress graph, compact subject bars, recent tests, and teacher notes. Watch your rank move up as you complete chapters and score well.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-gold-400/10 border border-gold-400/30">
                  <p className="text-sm text-gold-300">
                    📊 Quick Win: Complete your first chapter to see progress in action.
                  </p>
                </div>
              </div>
            </Step>

            <Step title="Notifications">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-ivory-50">
                  Stay Updated
                </h3>
                <p className="text-ivory-200/80 leading-relaxed">
                  Quarterly tests and important updates appear here first, then on WhatsApp after your teacher reviews. Never miss an announcement again.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-gold-400/10 border border-gold-400/30">
                  <p className="text-sm text-gold-300">
                    🔔 Enable notifications to get instant updates on new tests and schedules.
                  </p>
                </div>
              </div>
            </Step>

            <Step title="Ready to Go">
              <div className="space-y-4 text-center">
                <h3 className="font-serif text-xl font-semibold text-ivory-50">
                  You're All Set!
                </h3>
                <p className="text-ivory-200/80 leading-relaxed">
                  Explore your dashboard, check your batch schedule, and start tracking your progress. Your teachers are here to guide you every step of the way.
                </p>
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gold-400/10 to-gold-300/10 border border-gold-400/30">
                  <p className="text-sm text-gold-300">
                    ✨ First step: Go to your Profile to review your batch and subject details.
                  </p>
                </div>
              </div>
            </Step>
          </Stepper>
        </div>
      </BorderGlow>
    </div>
  );
}
