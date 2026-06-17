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

type ScheduledTest = {
  id: string;
  testName: string;
  subject: string;
  scheduledDate: string;
  scope: string;
  batchType: string;
  totalMarks: number;
};

function ScopePill({ scope }: { scope: string }) {
  const colors = useColors();
  const color =
    scope === "WEEKLY" ? "#60a5fa" :
    scope === "MONTHLY" ? "#4ade80" :
    "#D4AF37";
  return (
    <View style={{
      backgroundColor: `${color}18`,
      borderWidth: 1, borderColor: `${color}44`,
      borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2,
    }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color, textTransform: "uppercase" }}>
        {scope}
      </Text>
    </View>
  );
}

export default function TeacherSchedule() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState<ScheduledTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ScheduledTest[]>("/api/teacher/schedule")
      .then(setTests)
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = tests.filter(t => new Date(t.scheduledDate) >= now);
  const past = tests.filter(t => new Date(t.scheduledDate) < now);

  const s = styles(colors);

  const renderItem = ({ item }: { item: ScheduledTest }) => {
    const d = new Date(item.scheduledDate);
    const isPast = d < now;
    return (
      <View style={[s.card, isPast && { opacity: 0.65 }]}>
        <View style={s.dateCol}>
          <Text style={s.dateDay}>{d.getDate()}</Text>
          <Text style={s.dateMon}>
            {d.toLocaleString("default", { month: "short" }).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.testName}>{item.testName}</Text>
          <Text style={s.subject}>{item.subject} · {item.batchType}</Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 6, alignItems: "center" }}>
            <ScopePill scope={item.scope} />
            <Text style={s.marks}>{item.totalMarks} marks</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#050B1A", "#0A1628"]} style={{ flex: 1 }}>
      <View style={[s.headerWrap, { paddingTop: insets.top + 16 }]}>
        <Text style={s.eyebrow}>Teacher Portal</Text>
        <Text style={s.title}>Test Schedule</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.goldPrimary} />
        </View>
      ) : tests.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="calendar" size={36} color={colors.goldBorder} />
          <Text style={s.emptyTitle}>No Tests Scheduled</Text>
          <Text style={s.emptyText}>Create test schedules from the web dashboard.</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(upcoming.length > 0 ? [{ type: "header", label: `Upcoming (${upcoming.length})` }] : []),
            ...upcoming.map(t => ({ type: "item", ...t })),
            ...(past.length > 0 ? [{ type: "header", label: `Past (${past.length})` }] : []),
            ...past.map(t => ({ type: "item", ...t })),
          ]}
          keyExtractor={(item: any) => item.id || item.label}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 90 }]}
          renderItem={({ item }: { item: any }) => {
            if (item.type === "header") {
              return <Text style={s.sectionLabel}>{item.label}</Text>;
            }
            return renderItem({ item });
          }}
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
    list: { paddingHorizontal: 20 },
    sectionLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12, color: colors.ivoryDim,
      textTransform: "uppercase", letterSpacing: 0.8,
      marginBottom: 8, marginTop: 12,
    },
    card: {
      flexDirection: "row", gap: 14,
      backgroundColor: colors.navyCard,
      borderRadius: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 14, marginBottom: 8,
    },
    dateCol: {
      width: 40, alignItems: "center", justifyContent: "center",
    },
    dateDay: {
      fontFamily: "Inter_700Bold",
      fontSize: 22, color: colors.goldPrimary, lineHeight: 26,
    },
    dateMon: {
      fontFamily: "Inter_500Medium",
      fontSize: 10, color: colors.ivoryDim,
    },
    testName: {
      fontFamily: "Inter_700Bold",
      fontSize: 15, color: colors.ivory,
    },
    subject: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim, marginTop: 2,
    },
    marks: {
      fontFamily: "Inter_500Medium",
      fontSize: 11, color: colors.ivoryDim,
    },
    emptyState: {
      flex: 1, alignItems: "center", justifyContent: "center", padding: 40,
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
