import { useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowRight, AlertCircle, Loader2, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RomanWordmark } from "@/components/roman-wordmark";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent, demoUser?: string, demoPass?: string) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginUsername = demoUser || username;
    const loginPassword = demoPass || password;

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("ra_role", data.role);
      if (data.isDemo) localStorage.setItem("ra_is_demo", "true");
      else localStorage.removeItem("ra_is_demo");

      const redirectUrl = data.role === "teacher" ? "/teacher" : "/student";
      setLocation(redirectUrl);
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-950 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <RomanWordmark className="mx-auto justify-center mb-4" />
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ivory-100/60">
            Personal Tuition · Concept Focused · Result Driven
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
          <div className="relative rounded-xl border-2 border-gold-500/30 shadow-lg overflow-hidden bg-navy-900 aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800"
              alt="Roman Academy"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent flex flex-col justify-end p-6">
              <p className="text-gold-300 italic font-serif text-lg mb-1">शिक्षा ही शक्ति है</p>
              <p className="text-white text-sm font-semibold">Education is Power</p>
              <p className="text-ivory-100/60 text-xs mt-2">11th & 12th Science • Board + CET Prep • Navi Mumbai</p>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-sm text-ivory-100/60 mt-1">Login to your Roman Academy account</p>
              </div>

              <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ivory-100/80 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your.name.2026"
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/25 bg-navy-900 text-white placeholder-ivory-100/30 focus:ring-2 focus:ring-gold-400 focus:outline-none"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ivory-100/80 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/25 bg-navy-900 text-white placeholder-ivory-100/30 focus:ring-2 focus:ring-gold-400 focus:outline-none"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <>Login <ArrowRight className="size-4" /></>}
                </button>
              </form>

              <button
                onClick={(e) => handleLogin(e as any, "kunal.datkhile.2026", "student@123")}
                disabled={loading}
                className="w-full py-2 border border-gold-500/40 text-gold-300 font-semibold rounded-lg hover:bg-gold-400/10 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <LogIn className="size-4" /> Demo: Student Login
              </button>

              <div className="text-xs text-ivory-100/40 bg-navy-900 p-3 rounded-lg space-y-1">
                <p className="font-semibold text-ivory-100/60">Teacher access:</p>
                <p>roman_sir / Roman@123</p>
              </div>

              <div className="text-center">
                <Link href="/" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
                  ← Back to Roman Academy
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
