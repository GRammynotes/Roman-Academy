'use client';

import React from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  MessageSquareText,
  Search,
  Settings,
  Trophy,
  Upload,
  UserRound,
  Users,
  Menu,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RomanWordmark } from "@/components/roman-wordmark";
import { cn } from "@/lib/utils";

type ShellRole = "teacher" | "student" | "admin";

const teacherNavItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/upload-marks", label: "Upload marks", icon: Upload },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/syllabus", label: "Syllabus", icon: ClipboardList },
  { href: "/teacher/schedule", label: "Tests", icon: CalendarDays },
  { href: "/teacher/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/teacher/whatsapp", label: "WhatsApp", icon: MessageSquareText },
  { href: "/teacher/settings", label: "Settings", icon: Settings }
];

const teacherMobileItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/upload-marks", label: "Upload", icon: Upload },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/leaderboard", label: "Rank", icon: Trophy }
];

const studentNavItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/progress", label: "Progress", icon: LineChart },
  { href: "/student/tests", label: "Tests", icon: CalendarDays },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/student/profile", label: "Profile", icon: UserRound },
  { href: "/student/settings", label: "Settings", icon: Settings }
];

const studentMobileItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/tests", label: "Tests", icon: CalendarDays },
  { href: "/leaderboard", label: "Rank", icon: Trophy },
  { href: "/student/profile", label: "Profile", icon: UserRound }
];

const adminNavItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Search & Reports", icon: Search },
  { href: "/teacher/upload-marks", label: "Upload marks", icon: Upload },
  { href: "/teacher/students", label: "Manage Students", icon: Users },
  { href: "/teacher/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/teacher/settings", label: "Settings", icon: Settings }
];

const adminMobileItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Search", icon: Search },
  { href: "/teacher/upload-marks", label: "Upload", icon: Upload },
  { href: "/teacher/settings", label: "Settings", icon: Settings }
];

export function PageHeader({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        {eyebrow && <p className="text-sm text-gold-600 font-semibold uppercase tracking-widest">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-white mt-1">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function AppShell({
  children,
  active = "/teacher",
  role = "teacher"
}: {
  children: React.ReactNode;
  active?: string;
  role?: ShellRole;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const desktopNavItems =
    role === "admin"
      ? adminNavItems
      : role === "teacher"
        ? teacherNavItems
        : studentNavItems;

  const mobileNavItems =
    role === "admin"
      ? adminMobileItems
      : role === "teacher"
        ? teacherMobileItems
        : studentMobileItems;

  return (
    <div className="flex h-screen flex-col bg-navy-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col border-r border-gold-400/15 bg-navy-950 w-56">
        <div className="border-b border-gold-400/15 p-4">
          <RomanWordmark />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href || active.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-gold-400/20 text-gold-300 border border-gold-400/30"
                    : "text-ivory-100/70 hover:bg-white/10"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gold-400/15 p-4 text-xs text-ivory-100/50">
          <p>Roman Academy © 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar (Mobile + Tablet) */}
        <div className="flex items-center justify-between border-b border-gold-400/15 bg-navy-950 px-4 py-3 lg:hidden">
          <RomanWordmark />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 top-14 z-40 flex lg:hidden">
            <div
              className="flex-1 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="w-56 border-l border-gold-400/15 bg-navy-950 overflow-y-auto">
              <nav className="space-y-1 p-4">
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.href || active.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-gold-400/20 text-gold-300 border border-gold-400/30"
                          : "text-ivory-100/70 hover:bg-white/10"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 flex lg:hidden border-t border-gold-400/15 bg-navy-950">
        <div className="flex w-full items-center justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href || active.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition",
                  isActive
                    ? "text-gold-300 bg-gold-400/10 border-t-2 border-gold-300"
                    : "text-ivory-100/60 hover:bg-white/5"
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
