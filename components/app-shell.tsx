'use client';

import React, { useEffect, useState } from "react";
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
  X,
  Bell
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
        {eyebrow && <p className="text-sm text-gold-400 font-semibold uppercase tracking-widest">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-white mt-1 font-serif">{title}</h1>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real-time Notification States (WhatsApp/Instagram style)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeToast, setActiveToast] = useState<any>(null);

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

  // Fetch student notifications from API (only for student role)
  const fetchNotifications = async (initial = false) => {
    if (role !== "student") return;
    try {
      const res = await fetch("/api/student/notifications");
      if (res.ok) {
        const data = await res.json();
        // Check for new notifications to trigger toast alert
        if (!initial && data.length > 0) {
          const unreadNew = data.filter((n: any) => n.readAt === null);
          const currentUnreadIds = notifications.filter(n => n.readAt === null).map(n => n.id);
          const newlyArrived = unreadNew.find((n: any) => !currentUnreadIds.includes(n.id));
          
          if (newlyArrived) {
            setActiveToast(newlyArrived);
            // Hide toast after 6 seconds
            setTimeout(() => {
              setActiveToast(null);
            }, 6000);
          }
        }
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    // Dynamic polling simulation like a real-time web socket (polls every 12 seconds)
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [role]);

  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/student/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (res.ok) {
        // Dynamically update local state immediately
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
        setShowDropdown(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-navy-950 text-white lg:h-screen lg:flex-row">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col border-r border-gold-400/15 bg-navy-950 w-56 shrink-0">
        <div className="border-b border-gold-400/15 p-4 flex items-center justify-between">
          <RomanWordmark compact />
          
          {/* Desktop Bell Icon (Student only) */}
          {role === "student" && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-1.5 rounded-lg hover:bg-white/5 text-gold-400 hover:text-gold-300 transition-colors"
                aria-label="Toggle notifications"
              >
                <Bell className="size-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* WhatsApp/Instagram style dropdown */}
              {showDropdown && (
                <div className="absolute left-0 mt-2 z-50 w-72 bg-navy-900 border border-gold-400/20 rounded-xl shadow-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gold-400/10 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-gold-400 hover:text-gold-300"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((note) => (
                        <div key={note.id} className={cn("p-2 rounded-lg text-left", note.readAt ? "bg-navy-950/40 opacity-60" : "bg-navy-950 border border-gold-400/10")}>
                          <p className="font-bold text-xs text-white">{note.title}</p>
                          <p className="text-[10px] text-white/75 mt-0.5 leading-relaxed">{note.body}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-white/40 italic text-center py-4">No notifications.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gold-400/15 p-4 text-[10px] text-white/45 text-center">
          <p>Roman Academy © 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar (Mobile + Tablet) */}
        <div className="flex items-center justify-between border-b border-gold-400/15 bg-navy-950 px-4 py-3 lg:hidden">
          <RomanWordmark compact />
          
          <div className="flex items-center gap-2">
            {/* Mobile Notification Bell */}
            {role === "student" && (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gold-400"
                  aria-label="Toggle notifications"
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>

                {/* Mobile Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 z-50 w-72 bg-navy-900 border border-gold-400/20 rounded-xl shadow-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-gold-400/10 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-gold-400 hover:text-gold-300">
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.map((note) => (
                          <div key={note.id} className={cn("p-2 rounded-lg text-left", note.readAt ? "bg-navy-950/40 opacity-60" : "bg-navy-950 border border-gold-400/10")}>
                            <p className="font-bold text-xs text-white">{note.title}</p>
                            <p className="text-[10px] text-white/70 mt-0.5">{note.body}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-white/40 italic text-center py-2">No notifications.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 hover:bg-white/10 text-white"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] lg:hidden">
            <div
              className="flex-1 bg-black/50 backdrop-blur-sm"
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
                          : "text-white/70 hover:bg-white/10"
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
        <main className="min-w-0 flex-1 overflow-y-auto bg-navy-950 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 flex lg:hidden border-t border-gold-400/15 bg-navy-950 z-30">
        <div className="flex w-full items-center justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href || active.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition",
                  isActive
                    ? "text-gold-300 bg-gold-400/10 border-t-2 border-gold-300"
                    : "text-white/60 hover:bg-white/5"
                )}
              >
                <Icon className="size-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dynamic Slide-in Push Notification Toast (WhatsApp/Instagram style) */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 p-4 w-80 bg-navy-900 border border-gold-400/30 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-[10px] shrink-0 text-gold-400 font-bold">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-white flex justify-between items-center">
              <span>{activeToast.title}</span>
              <span className="text-[8px] text-emerald-400 font-bold uppercase">Now</span>
            </p>
            <p className="text-[10px] text-white/85 mt-0.5 leading-relaxed">{activeToast.body}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            className="text-white/40 hover:text-white shrink-0"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
