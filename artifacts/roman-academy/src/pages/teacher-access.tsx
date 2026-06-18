import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { RomanWordmark } from "@/components/roman-wordmark";

export default function TeacherAccessPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setErrorMsg("Missing access token. Please use the complete link provided to you.");
      setStatus("error");
      return;
    }

    fetch(`${import.meta.env.BASE_URL}api/auth/teacher-access?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("ra_role", "teacher");
          setLocation("/teacher");
        } else {
          setErrorMsg(data.error || "Access denied.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("Connection error. Please try again.");
        setStatus("error");
      });
  }, []);

  return (
    <main className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        <RomanWordmark className="justify-center" />

        {status === "loading" ? (
          <div className="space-y-3">
            <div className="size-16 mx-auto rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
              <ShieldCheck className="size-8 text-gold-400" />
            </div>
            <p className="text-white font-semibold">Authenticating…</p>
            <Loader2 className="size-5 mx-auto animate-spin text-gold-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="size-16 mx-auto rounded-full bg-red-900/20 border border-red-700/30 flex items-center justify-center">
              <AlertCircle className="size-8 text-red-400" />
            </div>
            <p className="text-red-400 font-semibold">Access Denied</p>
            <p className="text-sm text-ivory-100/50">{errorMsg}</p>
            <a href="/login" className="inline-block mt-2 text-sm text-gold-400 hover:text-gold-300 transition-colors">
              → Go to Login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
