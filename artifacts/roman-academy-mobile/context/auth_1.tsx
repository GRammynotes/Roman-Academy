import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/lib/api";

type AuthUser = {
  userId: string;
  role: "student" | "teacher";
  username: string;
  studentId?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const stored = await AsyncStorage.getItem("ra_user");
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          setUser(parsed);
        } else {
          await AsyncStorage.removeItem("ra_user");
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Invalid credentials" };
      }
      const authUser: AuthUser = {
        userId: data.userId,
        role: data.role,
        username: data.username,
        studentId: data.studentId,
      };
      await AsyncStorage.setItem("ra_user", JSON.stringify(authUser));
      setUser(authUser);
      return { ok: true };
    } catch {
      return { ok: false, error: "Connection error. Please try again." };
    }
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    await AsyncStorage.removeItem("ra_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
