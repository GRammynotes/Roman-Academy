import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";
import { apiGet } from "@/lib/api";

type DashboardStats = {
  totalStudents: number;
  avgScore: number;
  testsCreated: number;
  lowPerformers: number;
  recentActivity: Array<{ name: string; action: string; score: string }>;
};

const STAT_CONFIGS = [
  { key: "totalStudents", label: "Students", icon: "users", color: "#60a5fa" },
  { key: "avgScore", label: "Avg Score", icon: "bar-chart-2", color: "#4ade80", fmt: (v: number) => `${v}%` },
  { key: "testsCreated", label: "Tests", icon: "file-text", color: "#D4AF37" },
  { key: "lowPerformers", label: "Weak", icon: "alert-triangle", color: "#f87171" },
];

export default function TeacherDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DashboardStats>("/api/teacher/dashboard")
      .then(setStats)
      .catch(() => setStats({ totalStudents: 0, avgScore: 0, testsCreated: 0, lowPerformers: 0, recentActivity: [] }))
      .finally(() => setLoading(false));
  }, []);

  const s = styles(colors);

  const quickLinks = [
    { label: "Manage Students", icon: "users" as const, route: "/(teacher)/students" },
    { label: "Test Schedule", icon: "calendar" as const, route: "/(teacher)/schedule" },
    { label: "Leaderboard", icon: "award" as const, route: "/(teacher)/leaderboard" },
  ];

  return (
    <LinearGradient colors={["#050B1A", "#0A1628"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[s.scroll, {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 90,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.eyebrow}>Teacher Portal</Text>
            <Text style={s.greeting}>Dashboard</Text>
            <Text style={s.sub}>Welcome, {user?.username}</Text>
          </View>
          <Pressable onPress={logout} style={s.logoutBtn}>
            <Feather name="log-out" size={18} color={colors.ivoryDim} />
          </Pressable>
        </View>

        <View style={s.statsGrid}>
          {STAT_CONFIGS.map((cfg) => {
            const raw = (stats as any)?.[cfg.key] ?? 0;
            const val = loading ? "—" : (cfg.fmt ? cfg.fmt(raw) : String(raw));
            return (
              <View key={cfg.key} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: `${cfg.color}18` }]}>
                  <Feather name={cfg.icon as any} size={16} color={cfg.color} />
                </View>
                <Text style={s.statValue}>{val}</Text>
                <Text style={s.statLabel}>{cfg.label}</Text>
              </View>
            );
          })}
        </View>

        {loading ? (
          <View style={{ alignItems: "center", paddingTop: 24 }}>
            <ActivityIndicator color={colors.goldPrimary} />
          </View>
        ) : stats && stats.recentActivity.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            {stats.recentActivity.slice(0, 5).map((item, i) => (
              <View key={i} style={s.activityRow}>
                <View style={s.activityAvatar}>
                  <Text style={s.activityInitial}>
                    {item.name?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityName}>{item.name}</Text>
                  <Text style={s.activityAction}>{item.action}</Text>
                </View>
                {item.score ? (
                  <View style={s.scoreBadge}>
                    <Text style={s.scoreText}>{item.score}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : !loading && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <View style={s.emptyCard}>
              <Feather name="inbox" size={24} color={colors.goldBorder} style={{ marginBottom: 8 }} />
              <Text style={s.emptyText}>No recent activity. Upload test marks to get started.</Text>
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          {quickLinks.map((link) => (
            <Pressable
              key={link.route}
              style={({ pressed }) => [s.quickLink, pressed && { opacity: 0.7 }]}
              onPress={() => router.push(link.route as any)}
            >
              <View style={s.quickLinkLeft}>
                <View style={s.quickLinkIcon}>
                  <Feather name={link.icon} size={16} color={colors.goldPrimary} />
                </View>
                <Text style={s.quickLinkText}>{link.label}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.ivoryFaint} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// @ts-ignore
function styles(colors) {
  return StyleSheet.create({
    scroll: { padding: 20 },
    header: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "flex-start", marginBottom: 24,
    },
    eyebrow: {
      fontFamily: "Inter_500Medium",
      fontSize: 11, color: colors.goldPrimary,
      textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2,
    },
    greeting: {
      fontFamily: "Inter_700Bold",
      fontSize: 26, color: colors.ivory, marginBottom: 2,
    },
    sub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim,
    },
    logoutBtn: {
      padding: 8, borderRadius: 8,
      backgroundColor: "rgba(250,250,240,0.06)",
    },
    statsGrid: {
      flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24,
    },
    statCard: {
      flex: 1, minWidth: "45%",
      backgroundColor: colors.navyCard,
      borderRadius: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 16,
    },
    statIcon: {
      width: 32, height: 32, borderRadius: 8,
      alignItems: "center", justifyContent: "center", marginBottom: 10,
    },
    statValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 22, color: colors.ivory, marginBottom: 2,
    },
    statLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 11, color: colors.ivoryDim,
      textTransform: "uppercase", letterSpacing: 0.5,
    },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14, color: colors.ivory, marginBottom: 12,
    },
    activityRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.navyCard,
      borderRadius: 10,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 12, marginBottom: 8,
    },
    activityAvatar: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: "rgba(212,175,55,0.12)",
      alignItems: "center", justifyContent: "center",
    },
    activityInitial: {
      fontFamily: "Inter_700Bold",
      fontSize: 14, color: colors.goldPrimary,
    },
    activityName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13, color: colors.ivory,
    },
    activityAction: {
      fontFamily: "Inter_400Regular",
      fontSize: 11, color: colors.ivoryDim,
    },
    scoreBadge: {
      backgroundColor: "rgba(212,175,55,0.12)",
      borderWidth: 1, borderColor: colors.goldBorder,
      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    },
    scoreText: {
      fontFamily: "Inter_700Bold",
      fontSize: 12, color: colors.goldPrimary,
    },
    emptyCard: {
      backgroundColor: colors.navyCard,
      borderRadius: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 24, alignItems: "center",
    },
    emptyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13, color: colors.ivoryDim, textAlign: "center",
    },
    quickLink: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.navyCard,
      borderRadius: 10,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 14, marginBottom: 8,
    },
    quickLinkLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    quickLinkIcon: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: "rgba(212,175,55,0.1)",
      alignItems: "center", justifyContent: "center",
    },
    quickLinkText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14, color: colors.ivory,
    },
  });
}
