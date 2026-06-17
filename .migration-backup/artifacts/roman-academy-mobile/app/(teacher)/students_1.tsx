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

type Student = {
  id: string;
  fullName: string;
  username: string;
  batchType: string;
  classLevel: string;
  stream: string;
  average: number | null;
  rank: number | null;
};

function AvgBadge({ avg }: { avg: number | null }) {
  const colors = useColors();
  if (avg === null) return (
    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.ivoryFaint }}>N/A</Text>
  );
  const color = avg >= 75 ? "#4ade80" : avg >= 65 ? colors.goldPrimary : "#f87171";
  return (
    <View style={{
      backgroundColor: `${color}22`, borderWidth: 1, borderColor: `${color}55`,
      borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
    }}>
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color }}>{avg}%</Text>
    </View>
  );
}

export default function TeacherStudents() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Student[]>("/api/teacher/students")
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const s = styles(colors);

  return (
    <LinearGradient colors={["#050B1A", "#0A1628"]} style={{ flex: 1 }}>
      <View style={[s.headerWrap, { paddingTop: insets.top + 16 }]}>
        <Text style={s.eyebrow}>Teacher Portal</Text>
        <Text style={s.title}>Students</Text>
        {!loading && (
          <Text style={s.count}>{students.length} enrolled</Text>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.goldPrimary} />
        </View>
      ) : students.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="users" size={36} color={colors.goldBorder} />
          <Text style={s.emptyTitle}>No Students Yet</Text>
          <Text style={s.emptyText}>Add students from the web dashboard to see them here.</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 90 }]}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.avatarWrap}>
                <Text style={s.avatarText}>{item.fullName[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.fullName}</Text>
                <Text style={s.username}>@{item.username}</Text>
                <Text style={s.batch}>{item.batchType} · {item.classLevel}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <AvgBadge avg={item.average} />
                {item.rank && (
                  <Text style={s.rankText}>#{item.rank}</Text>
                )}
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
    count: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim, marginTop: 2,
    },
    list: { paddingHorizontal: 20, paddingTop: 4 },
    card: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.navyCard,
      borderRadius: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
      padding: 14, marginBottom: 8,
    },
    avatarWrap: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: "rgba(212,175,55,0.12)",
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.goldBorder,
    },
    avatarText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16, color: colors.goldPrimary,
    },
    name: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14, color: colors.ivory,
    },
    username: {
      fontFamily: "Inter_400Regular",
      fontSize: 11, color: colors.ivoryDim,
    },
    batch: {
      fontFamily: "Inter_400Regular",
      fontSize: 11, color: colors.ivoryFaint, marginTop: 2,
    },
    rankText: {
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
