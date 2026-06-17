import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { apiGet } from "@/lib/api";

type ProgressData = {
  fullName: string;
  batchType: string;
  rank: number | null;
  average: number | null;
  cetReadiness: number;
  attendance: number;
  subjectScores: Array<{ subject: string; avg: number }>;
};

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const colors = useColors();
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <View style={{ marginTop: 4 }}>
      <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
        <View style={{
          width: `${pct}%`, height: 6,
          backgroundColor: color, borderRadius: 3,
        }} />
      </View>
    </View>
  );
}

export default function StudentProgress() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ProgressData>("/api/student/progress")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const s = styles(colors);

  const summaryStats = data ? [
    { label: "Class Rank", value: data.rank ? `#${data.rank}` : "N/A", icon: "award", color: colors.goldPrimary },
    { label: "Test Average", value: data.average ? `${data.average}%` : "N/A", icon: "bar-chart-2", color: "#4ade80" },
    { label: "CET Ready", value: `${data.cetReadiness}%`, icon: "zap", color: "#60a5fa" },
    { label: "Attendance", value: `${data.attendance}%`, icon: "check-circle", color: colors.goldPrimary },
  ] : [];

  return (
    <LinearGradient colors={["#050B1A", "#0A1628"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[s.scroll, {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 90,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerWrap}>
          <Text style={s.eyebrow}>Student Portal</Text>
          <Text style={s.title}>My Progress</Text>
          {data && <Text style={s.subtitle}>{data.batchType}</Text>}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", paddingTop: 60 }}>
            <ActivityIndicator color={colors.goldPrimary} />
          </View>
        ) : !data ? (
          <View style={s.emptyState}>
            <Feather name="trending-up" size={36} color={colors.goldBorder} />
            <Text style={s.emptyTitle}>No Data Yet</Text>
            <Text style={s.emptyText}>Progress data will appear after tests are uploaded.</Text>
          </View>
        ) : (
          <>
            <View style={s.statsGrid}>
              {summaryStats.map((stat) => (
                <View key={stat.label} style={s.statCard}>
                  <Feather name={stat.icon as any} size={16} color={stat.color} style={{ marginBottom: 6 }} />
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {data.subjectScores && data.subjectScores.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Subject Performance</Text>
                {data.subjectScores.map((subject) => {
                  const color = subject.avg >= 75 ? "#4ade80" :
                    subject.avg >= 65 ? colors.goldPrimary : "#f87171";
                  return (
                    <View key={subject.subject} style={s.subjectRow}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={s.subjectName}>{subject.subject}</Text>
                        <Text style={[s.subjectScore, { color }]}>{subject.avg}%</Text>
                      </View>
                      <ProgressBar value={subject.avg} color={color} />
                    </View>
                  );
                })}
              </View>
            )}

            <View style={s.section}>
              <Text style={s.sectionTitle}>Overall Readiness</Text>
              <View style={s.readinessCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={s.subjectName}>Board Exam Readiness</Text>
                  <Text style={s.subjectScore}>{data.average || 0}%</Text>
                </View>
                <ProgressBar value={data.average || 0} color={colors.goldPrimary} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 4 }}>
                  <Text style={s.subjectName}>CET Readiness</Text>
                  <Text style={s.subjectScore}>{data.cetReadiness}%</Text>
                </View>
                <ProgressBar value={data.cetReadiness} color="#60a5fa" />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 4 }}>
                  <Text style={s.subjectName}>Attendance</Text>
                  <Text style={s.subjectScore}>{data.attendance}%</Text>
                </View>
                <ProgressBar value={data.attendance} color="#4ade80" />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// @ts-ignore
function styles(colors) {
  return StyleSheet.create({
    scroll: { padding: 20 },
    headerWrap: { marginBottom: 24 },
    eyebrow: {
      fontFamily: "Inter_500Medium",
      fontSize: 11, color: colors.goldPrimary,
      textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 26, color: colors.ivory, marginBottom: 2,
    },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim,
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
      fontSize: 14, color: colors.ivory, marginBottom: 12,
    },
    subjectRow: {
      backgroundColor: colors.navyCard,
      borderRadius: 10,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 14, marginBottom: 8,
    },
    subjectName: {
      fontFamily: "Inter_500Medium",
      fontSize: 13, color: colors.ivory,
    },
    subjectScore: {
      fontFamily: "Inter_700Bold",
      fontSize: 13, color: colors.goldPrimary,
    },
    readinessCard: {
      backgroundColor: colors.navyCard,
      borderRadius: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 16,
    },
    emptyState: {
      flex: 1, alignItems: "center", paddingTop: 60,
    },
    emptyTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16, color: colors.ivory,
      marginTop: 12, marginBottom: 6,
    },
    emptyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13, color: colors.ivoryDim, textAlign: "center",
    },
  });
}
