import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { apiGet } from "@/lib/api";

type TestResult = {
  id: string;
  testName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  testDate: string;
  scope: string;
};

function ScoreBadge({ pct }: { pct: number }) {
  const colors = useColors();
  const color =
    pct >= 75 ? "#4ade80" :
    pct >= 65 ? colors.goldPrimary :
    "#f87171";
  return (
    <View style={{
      backgroundColor: `${color}22`,
      borderWidth: 1, borderColor: `${color}55`,
      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    }}>
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color }}>{pct}%</Text>
    </View>
  );
}

export default function StudentTests() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<TestResult[]>("/api/student/tests")
      .then(setTests)
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  const s = styles(colors);

  return (
    <LinearGradient colors={["#050B1A", "#0A1628"]} style={{ flex: 1 }}>
      <View style={[s.headerWrap, { paddingTop: insets.top + 16 }]}>
        <Text style={s.eyebrow}>Student Portal</Text>
        <Text style={s.title}>Test Results</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.goldPrimary} />
        </View>
      ) : tests.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="file-text" size={36} color={colors.goldBorder} />
          <Text style={s.emptyTitle}>No Test Results Yet</Text>
          <Text style={s.emptyText}>Your scores will appear here after your teacher uploads them.</Text>
        </View>
      ) : (
        <FlatList
          data={tests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 90 }]}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.testName}>{item.testName}</Text>
                  <Text style={s.subject}>{item.subject}</Text>
                </View>
                <ScoreBadge pct={item.percentage} />
              </View>
              <View style={s.cardBottom}>
                <View style={s.pill}>
                  <Text style={s.pillText}>{item.scope}</Text>
                </View>
                <Text style={s.marks}>{item.marksObtained}/{item.totalMarks} marks</Text>
                <Text style={s.date}>{new Date(item.testDate).toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      )}
    </LinearGradient>
  );
}

// @ts-ignore
function styles(colors) {
  return StyleSheet.create({
    headerWrap: { paddingHorizontal: 20, paddingBottom: 16 },
    eyebrow: {
      fontFamily: "Inter_500Medium",
      fontSize: 11, color: colors.goldPrimary,
      textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 26, color: colors.ivory,
    },
    list: { paddingHorizontal: 20, paddingTop: 4 },
    card: {
      backgroundColor: colors.navyCard,
      borderRadius: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 16, marginBottom: 10,
    },
    cardTop: {
      flexDirection: "row", alignItems: "flex-start",
      justifyContent: "space-between", marginBottom: 10,
    },
    testName: {
      fontFamily: "Inter_700Bold",
      fontSize: 15, color: colors.ivory, marginBottom: 2,
    },
    subject: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim,
    },
    cardBottom: {
      flexDirection: "row", alignItems: "center", gap: 8,
    },
    pill: {
      backgroundColor: "rgba(212,175,55,0.1)",
      borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
      borderWidth: 1, borderColor: colors.goldBorder,
    },
    pillText: {
      fontFamily: "Inter_500Medium",
      fontSize: 10, color: colors.goldPrimary,
      textTransform: "uppercase",
    },
    marks: {
      fontFamily: "Inter_500Medium",
      fontSize: 12, color: colors.ivoryDim, flex: 1,
    },
    date: {
      fontFamily: "Inter_400Regular",
      fontSize: 11, color: colors.ivoryFaint,
    },
    emptyState: {
      flex: 1, alignItems: "center", justifyContent: "center",
      padding: 40,
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
