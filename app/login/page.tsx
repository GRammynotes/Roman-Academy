"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Loader2, LogIn } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { RomanWordmark } from "@/components/roman-wordmark";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent, demoUsername?: string, demoPassword?: string) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginUsername = demoUsername || username;
    const loginPassword = demoPassword || password;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      document.cookie = `ra_role=${data.role}; path=/; SameSite=Strict`;
      const redirectUrl = data.role === "teacher" ? "/teacher" : "/student";
      router.push(redirectUrl);
    } catch (err) {
      setError("Connection error");
      setLoading(false);
    }
  };

  const handleDemoLogin = (e: React.FormEvent) => {
    handleLogin(e, "kunal.datkhile.11.2026", "student@123");
  };

  return (
    <main className="min-h-screen bg-ivory-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <RomanWordmark className="mx-auto mb-4" />
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-navy-950">
            Personal tuition | Concept focused | Result driven
          </p>
        </div>

        {/* Two Column: Image Left + Form Right */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
          {/* LEFT: Results Image */}
          <div className="relative rounded-xl border-2 border-gold-500/40 shadow-lg overflow-hidden bg-white">
            <Image
              src="/roman-academy-cover.webp"
              alt="Results Brochure"
              width={400}
              height={500}
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-950 to-transparent p-4 text-center">
              <p className="text-gold-300 italic font-serif text-sm">शिक्षा ही शक्ति है</p>
              <p className="text-white text-xs mt-1">Education is Power</p>
            </div>
          </div>

          {/* RIGHT: Login Form */}
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-navy-950">Welcome</h1>
                <p className="text-sm text-navy-800/60 mt-1">Login to your account</p>
              </div>

              <form onSubmit={(e) => handleLogin(e)} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-navy-950 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kunal.datkhile.11.2026"
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/25 focus:ring-2 focus:ring-gold-400 focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-950 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/25 focus:ring-2 focus:ring-gold-400 focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                    <AlertCircle className="size-4" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gold-500 text-navy-950 font-semibold rounded-lg hover:bg-gold-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <>Login <ArrowRight className="size-4" /></>}
                </button>
              </form>

              {/* Demo Button */}
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2 border-2 border-gold-500 text-navy-950 font-semibold rounded-lg hover:bg-gold-50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn className="size-4" />
                Demo: Kunal Datkhile
              </button>

              {/* Info */}
              <div className="text-xs text-navy-800 bg-gold-50 p-3 rounded-lg">
                <p className="font-semibold">Other accounts:</p>
                <p className="mt-1">Teacher: roman_sir / Roman@123</p>
                <p>Student: rujula.khamkar.12.2026 / student@123</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Stack Info */}
        <div className="lg:hidden mt-6 text-center text-xs text-navy-800">
          <p>📱 Scroll down to see login form on mobile</p>
        </div>
      </div>
    </main>
  );
}
