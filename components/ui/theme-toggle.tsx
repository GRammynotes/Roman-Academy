"use client";

import { useState, useEffect } from "react";
import { Moon, Sparkles } from "lucide-react";

export function ThemeToggle() {
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ra_effects_enabled");
    if (saved !== null) {
      setEffectsEnabled(saved === "true");
    }
  }, []);

  const toggleEffects = () => {
    const next = !effectsEnabled;
    setEffectsEnabled(next);
    localStorage.setItem("ra_effects_enabled", String(next));
    
    // Dispatch a custom event so other components (like Lightfall wrapper) can listen
    window.dispatchEvent(new CustomEvent("theme-effect-toggle", { detail: next }));
  };

  return (
    <button
      onClick={toggleEffects}
      className="p-2 rounded-lg border border-gold-400/20 bg-navy-950/50 hover:bg-white/10 text-gold-300 transition-colors flex items-center gap-2 text-xs font-semibold"
      title={effectsEnabled ? "Disable animations" : "Enable animations"}
    >
      {effectsEnabled ? <Sparkles className="size-4" /> : <Moon className="size-4" />}
      <span className="hidden sm:inline">{effectsEnabled ? "Effects On" : "Effects Off"}</span>
    </button>
  );
}
