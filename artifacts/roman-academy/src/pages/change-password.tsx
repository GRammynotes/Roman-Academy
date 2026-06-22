import { useState } from "react";
import { useLocation } from "wouter";
import { KeyRound, ArrowRight, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";

export default function ChangePasswordPage() {
  const [, setLocation] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword === currentPassword) { setError("New password must be different from current password."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to change password."); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => {
        const role = localStorage.getItem("ra_role") || "student";
        setLocation(role === "teacher" ? "/teacher" : "/student");
      }, 1800);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.06) 0%, transparent 55%), #050B1A" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <RomanWordmark className="mx-auto justify-center mb-4" />
        </div>

        <div className="rounded-2xl border border-gold-400/25 bg-navy-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />
          <div className="p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/25 flex items-center justify-center">
                <KeyRound className="size-5 text-gold-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Set New Password</h1>
                <p className="text-xs text-ivory-100/50 mt-0.5">First login — please choose a secure password</p>
              </div>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle className="size-10 text-emerald-400" />
                <p className="text-white font-semibold">Password updated!</p>
                <p className="text-sm text-ivory-100/60">Redirecting to your dashboard…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ivory-100/70 mb-1.5 uppercase tracking-wider">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-950/80 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:outline-none transition-all text-sm"
                    required disabled={loading} autoComplete="current-password" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ivory-100/70 mb-1.5 uppercase tracking-wider">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-950/80 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:outline-none transition-all text-sm"
                    required disabled={loading} autoComplete="new-password" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ivory-100/70 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-950/80 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:outline-none transition-all text-sm"
                    required disabled={loading} autoComplete="new-password" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm">
                    <AlertCircle className="size-4 shrink-0" />{error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.3)] text-sm mt-2">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <>Update Password <ArrowRight className="size-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-ivory-100/30 mt-4">
          This is a one-time step for account security.
        </p>
      </div>
    </main>
  );
}
