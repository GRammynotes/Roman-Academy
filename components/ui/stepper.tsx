"use client";

import { useState, ReactNode } from "react";
import { motion } from "motion/react";

export interface StepProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Step({ children }: StepProps) {
  return <>{children}</>;
}

interface StepperProps {
  children: ReactNode[];
  onComplete?: () => void;
  disableIndicators?: boolean;
}

export default function Stepper({
  children,
  onComplete,
  disableIndicators = false
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = Array.isArray(children) ? children : [children];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {steps[currentStep]}
      </motion.div>

      {!disableIndicators && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-gold-400"
                    : "w-2 bg-navy-900/15 hover:bg-navy-900/30"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                currentStep === 0
                  ? "cursor-not-allowed bg-navy-900/10 text-navy-900/40"
                  : "bg-navy-900/5 text-navy-900 hover:bg-navy-900/10"
              }`}
              whileTap={currentStep !== 0 ? { scale: 0.95 } : {}}
            >
              Back
            </motion.button>

            <motion.button
              onClick={handleNext}
              className="rounded-lg bg-gold-400 px-6 py-2 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLastStep ? "Finish" : "Next"}
            </motion.button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-navy-900/50">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
}
