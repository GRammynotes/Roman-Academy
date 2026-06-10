"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  "Track your main class syllabus separately from any alternate CET lecture stream.",
  "Your profile shows one progress graph, compact subject bars, recent tests and teacher notes.",
  "Quarterly tests and important updates appear here first, then WhatsApp after teacher review."
];

export function WalkthroughPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem("ra_student_walkthrough_completed");
    if (!completed) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("ra_student_walkthrough_completed", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-academy border border-gold-400/40 bg-navy-900 text-white p-5 shadow-elite">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gold-400">First login</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold">Roman Academy walkthrough</h2>
          </div>
          <button aria-label="Close walkthrough" className="rounded-lg p-2 text-ivory-100 hover:bg-white/5" onClick={handleClose}>
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-5 min-h-16 text-sm leading-6 text-ivory-100/80">{steps[step]}</p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <span key={index} className={`h-1.5 w-8 rounded-full ${index === step ? "bg-gold-400" : "bg-white/10"}`} />
            ))}
          </div>
          <Button
            onClick={() => {
              if (step === steps.length - 1) handleClose();
              else setStep((current) => current + 1);
            }}
            className="bg-gold-400 text-navy-950 hover:bg-gold-300 font-bold"
          >
            {step === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
