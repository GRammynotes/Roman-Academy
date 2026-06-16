import { Ionicons, Feather } from "@expo/vector-icons";
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

type Profile = {
  fullName: string;
  rank: number | null;
  average: number | null;
  batchType: string;
  cetReadiness: number;
  attendance: number;
  currentChapter: string;
  nextTest: string;
};

const STATS = [
  { key: "rank", label: "Rank", icon: "trophy", fmt: (v: any) => v ? `#${v}` : "N/A" },
  { key: "average", label: "Average", icon: "bar-chart-2", fmt: (v: any) => v ? `${v}%` : "N/A" },
  { key: "cetReadiness", label: "CET Ready", icon: "zap", fmt: (v: any) => v ? `${v}%` : "N/A" },
  { key: "attendance", label: "Attendance", icon: "check-circle", fmt: (v: any) => v ? `${v}%` : "N/A" },
];

export default function StudentDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Profile>("/api/student/profile")
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const s = styles(colors);
  const firstName = profile?.fullName?.split(" ")[0] || user?.username || "Student";

  const quickLinks = [
    { label: "View Tests", icon: "file-text" as const, route: "/(student)/tests" },
    { label: "My Progress", icon: "trending-up" as const, route: "/(student)/progress" },
    { label: "Leaderboard", icon: "award" as const, route: "/(student)/leaderboard" },
  ];

  return (
    <LinearGradient colors={["#050B1A", "#0A1628"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.eyebrow}>Student Portal</Text>
            <Text style={s.greeting}>Hello, {firstName}!</Text>
            {profile?.batchType && (
              <Text style={s.batch}>{profile.batchType}</Text>
            )}
          </View>
          <Pressable onPress={logout} style={s.logoutBtn}>
            <Feather name="log-out" size={18} color={colors.ivoryDim} />
          </Pressable>
        </View>

        <View style={s.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.key} style={s.statCard}>
              <Feather name={stat.icon as any} size={16} color={colors.goldPrimary} style={{ marginBottom: 8 }} />
              <Text style={s.statValue}>
                {loading ? "—" : stat.fmt((profile as any)?.[stat.key])}
              </Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {!loading && profile && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              <Ionicons name="notifications" size={16} color={colors.goldPrimary} /> Notifications
            </Text>
            <View style={s.notifCard}>
              <Text style={s.notifHeading}>Current Chapter</Text>
              <Text style={s.notifBody}>{profile.currentChapter || "—"}</Text>
            </View>
            <View style={[s.notifCard, { marginTop: 8 }]}>
              <Text style={s.notifHeading}>Next Test</Text>
              <Text style={s.notifBody}>{profile.nextTest || "—"}</Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={{ alignItems: "center", paddingTop: 32 }}>
            <ActivityIndicator color={colors.goldPrimary} />
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
    batch: {
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
      fontSize: 14, color: colors.ivory,
      marginBottom: 12,
    },
    notifCard: {
      backgroundColor: colors.navyCard,
      borderRadius: 10,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 14,
    },
    notifHeading: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13, color: colors.ivory, marginBottom: 3,
    },
    notifBody: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim,
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
