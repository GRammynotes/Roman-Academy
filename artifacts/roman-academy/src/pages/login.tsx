import { lazy, Suspense, useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";

const Ferrofluid = lazy(() => import("@/components/react-bits/Ferrofluid"));

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      localStorage.setItem("ra_role", data.role);
      if (data.firstLogin) {
        setLocation(`/change-password`);
        return;
      }
      setLocation(data.role === "teacher" ? "/teacher" : "/student");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-950 relative flex flex-col items-center justify-center overflow-hidden">
      {/* Ferrofluid background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Suspense fallback={null}>
          <Ferrofluid
            colors={["#D4AF37","#B8962E","#071A3D","#0A1628","#D4AF37"]}
            speed={0.3}
            scale={1.8}
            turbulence={0.8}
            fluidity={0.12}
            rimWidth={0.18}
            sharpness={2.5}
            shimmer={1.2}
            glow={1.8}
            flowDirection="down"
            opacity={1}
            mouseInteraction={true}
            mouseStrength={0.6}
            mouseRadius={0.3}
          />
        </Suspense>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(5,11,26,0.6) 0%, rgba(5,11,26,0.9) 80%)" }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <RomanWordmark className="mx-auto justify-center mb-4" />
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ivory-100/60">
            Personal Tuition · Concept Focused · Result Driven
          </p>
        </div>

        <div className="rounded-2xl border border-gold-400/25 bg-navy-950/80 backdrop-blur-xl shadow-2xl shadow-navy-950/80 overflow-hidden">
          {/* Gold top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />

          <div className="p-7 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-sm text-ivory-100/55 mt-1">Sign in to your Roman Academy account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ivory-100/70 mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.name.2026"
                  className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-900/80 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 focus:outline-none transition-all text-sm"
                  required disabled={loading} autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ivory-100/70 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gold-500/25 bg-navy-900/80 text-white placeholder-ivory-100/25 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 focus:outline-none transition-all text-sm"
                  required disabled={loading} autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm">
                  <AlertCircle className="size-4 shrink-0" />{error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.3)] text-sm"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>Sign In <ArrowRight className="size-4" /></>}
              </button>
            </form>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-ivory-100/35">
                Contact your teacher if you don't have an account.
              </p>
            </div>

            <div className="text-center pt-1">
              <Link href="/" className="text-xs text-gold-400/70 hover:text-gold-300 transition-colors">
                ← Back to Roman Academy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
