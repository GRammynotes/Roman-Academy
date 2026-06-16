import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { apiGet } from "@/lib/api";

type LeaderboardEntry = {
  id: string;
  fullName: string;
  batchType: string;
  average: number;
  lastTest: number | null;
  rank: number;
  rankMovement: number | null;
};

const SCOPES = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "overall", label: "Overall" },
] as const;

function MovementTag({ val }: { val: number | null }) {
  const colors = useColors();
  if (val === null) return (
    <View style={{ backgroundColor: "rgba(250,250,240,0.05)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 10, color: colors.ivoryFaint }}>NEW</Text>
    </View>
  );
  if (val > 0) return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      <Feather name="arrow-up" size={11} color="#4ade80" />
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: "#4ade80" }}>{val}</Text>
    </View>
  );
  if (val < 0) return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      <Feather name="arrow-down" size={11} color="#f87171" />
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: "#f87171" }}>{Math.abs(val)}</Text>
    </View>
  );
  return <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(250,250,240,0.3)" }}>—</Text>;
}

export default function TeacherLeaderboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<"weekly" | "monthly" | "quarterly" | "overall">("weekly");
  const [batch, setBatch] = useState("12th Science 2026");
  const [students, setStudents] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<LeaderboardEntry[]>(`/api/teacher/leaderboard?scope=${scope}&batch=${encodeURIComponent(batch)}`)
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [scope, batch]);

  const s = styles(colors);

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
          <Text style={s.eyebrow}>Teacher Portal</Text>
          <Text style={s.title}>Leaderboard</Text>
        </View>

        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scopeRow}
        >
          {SCOPES.map((sc) => (
            <Pressable
              key={sc.key}
              onPress={() => setScope(sc.key)}
              style={[s.scopeTab, scope === sc.key && s.scopeTabActive]}
            >
              <Text style={[s.scopeTabText, scope === sc.key && s.scopeTabTextActive]}>
                {sc.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <ActivityIndicator color={colors.goldPrimary} />
          </View>
        ) : students.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="trophy-outline" size={40} color={colors.goldBorder} />
            <Text style={s.emptyTitle}>No Rankings Yet</Text>
            <Text style={s.emptyText}>Rankings appear after test results are uploaded.</Text>
          </View>
        ) : (
          <>
            {students.map((item) => (
              <View key={item.id} style={s.row}>
                <View style={s.rankBadge}>
                  <Text style={s.rankNum}>#{item.rank}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.fullName}</Text>
                  <Text style={s.batchText}>{item.batchType}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={s.scoreText}>{item.average}%</Text>
                  <MovementTag val={item.rankMovement} />
                </View>
              </View>
            ))}
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
    headerWrap: { marginBottom: 16 },
    eyebrow: {
      fontFamily: "Inter_500Medium",
      fontSize: 11, color: colors.goldPrimary,
      textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 26, color: colors.ivory,
    },
    scopeRow: { gap: 8, paddingBottom: 16 },
    scopeTab: {
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1, borderColor: colors.goldBorder,
    },
    scopeTabActive: {
      backgroundColor: "rgba(212,175,55,0.15)",
      borderColor: "rgba(212,175,55,0.5)",
    },
    scopeTabText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13, color: colors.ivoryDim,
    },
    scopeTabTextActive: {
      color: colors.goldPrimary,
      fontFamily: "Inter_700Bold",
    },
    row: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.navyCard,
      borderRadius: 10,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 12, marginBottom: 8,
    },
    rankBadge: {
      width: 36, height: 36, borderRadius: 8,
      backgroundColor: "rgba(212,175,55,0.08)",
      alignItems: "center", justifyContent: "center",
    },
    rankNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 13, color: colors.goldPrimary,
    },
    name: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14, color: colors.ivory,
    },
    batchText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11, color: colors.ivoryDim,
    },
    scoreText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14, color: colors.goldPrimary,
    },
    emptyState: {
      alignItems: "center", paddingTop: 60,
    },
    emptyTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16, color: colors.ivory, marginTop: 12, marginBottom: 6,
    },
    emptyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13, color: colors.ivoryDim, textAlign: "center",
    },
  });
}
