import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(u?: string, p?: string) {
    const user = u || username;
    const pass = p || password;
    if (!user || !pass) { setError("Enter username and password"); return; }
    setError("");
    setLoading(true);
    const result = await login(user, pass);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Login failed");
    }
  }

  const s = styles(colors);

  return (
    <LinearGradient
      colors={["#050B1A", "#0A1628", "#0F2040"]}
      style={[s.root, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.hero}>
            <View style={s.crestWrap}>
              <Ionicons name="school" size={40} color={colors.goldPrimary} />
            </View>
            <Text style={s.brand}>Roman Academy</Text>
            <Text style={s.tagline}>शिक्षा ही शक्ति है  ·  Education is Power</Text>
            <Text style={s.subtitle}>11th & 12th Science · Board + CET · Navi Mumbai</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Welcome Back</Text>
            <Text style={s.cardSub}>Sign in to your account</Text>

            {!!error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={14} color="#f87171" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.field}>
              <Text style={s.label}>Username</Text>
              <TextInput
                style={s.input}
                value={username}
                onChangeText={setUsername}
                placeholder="your.name.2026"
                placeholderTextColor={colors.ivoryFaint}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <View style={s.passWrap}>
                <TextInput
                  style={[s.input, { flex: 1, borderWidth: 0, paddingRight: 40 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.ivoryFaint}
                  secureTextEntry={!showPass}
                  editable={!loading}
                />
                <Pressable style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                  <Ionicons
                    name={showPass ? "eye-off" : "eye"}
                    size={18}
                    color={colors.ivoryDim}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[s.loginBtn, loading && { opacity: 0.6 }]}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.navyDeep} />
              ) : (
                <>
                  <Text style={s.loginBtnText}>Login</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.navyDeep} />
                </>
              )}
            </Pressable>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <Pressable
              style={[s.demoBtn, loading && { opacity: 0.6 }]}
              onPress={() => handleLogin("roman_sir", "Roman@123")}
              disabled={loading}
            >
              <Ionicons name="person-circle-outline" size={16} color={colors.goldPrimary} />
              <Text style={s.demoBtnText}>Demo: Teacher Login</Text>
            </Pressable>

            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Demo accounts</Text>
              <Text style={s.hintText}>Teacher: roman_sir / Roman@123</Text>
              <Text style={s.hintText}>Student: Create via teacher dashboard</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// @ts-ignore
function styles(colors) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
    hero: { alignItems: "center", marginBottom: 32 },
    crestWrap: {
      width: 72, height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(212,175,55,0.12)",
      alignItems: "center", justifyContent: "center",
      marginBottom: 14,
      borderWidth: 1.5,
      borderColor: "rgba(212,175,55,0.3)",
    },
    brand: {
      fontFamily: "Inter_700Bold",
      fontSize: 28, color: colors.ivory,
      letterSpacing: 0.5, marginBottom: 6,
    },
    tagline: {
      fontFamily: "Inter_500Medium",
      fontSize: 13, color: colors.goldFaint,
      textAlign: "center", marginBottom: 4,
    },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.navyCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.goldBorder,
      padding: 24,
    },
    cardTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 22, color: colors.ivory, marginBottom: 4,
    },
    cardSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13, color: colors.ivoryDim, marginBottom: 20,
    },
    errorBox: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: "rgba(239,68,68,0.1)",
      borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
      borderRadius: 8, padding: 10, marginBottom: 14,
    },
    errorText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13, color: "#f87171", flex: 1,
    },
    field: { marginBottom: 14 },
    label: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12, color: "rgba(250,250,240,0.7)",
      marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.navyElevated,
      borderWidth: 1, borderColor: colors.goldBorder,
      borderRadius: 10, padding: 12,
      fontFamily: "Inter_400Regular",
      fontSize: 14, color: colors.ivory,
    },
    passWrap: {
      flexDirection: "row",
      backgroundColor: colors.navyElevated,
      borderWidth: 1, borderColor: colors.goldBorder,
      borderRadius: 10, alignItems: "center",
    },
    eyeBtn: { padding: 12, position: "absolute", right: 0 },
    loginBtn: {
      backgroundColor: colors.goldPrimary,
      borderRadius: 10, padding: 14,
      flexDirection: "row",
      alignItems: "center", justifyContent: "center", gap: 8,
      marginTop: 6, marginBottom: 16,
    },
    loginBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 15, color: colors.navyDeep,
    },
    divider: {
      flexDirection: "row", alignItems: "center", marginBottom: 14,
    },
    dividerLine: {
      flex: 1, height: 1, backgroundColor: colors.goldBorder,
    },
    dividerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: colors.ivoryDim,
      marginHorizontal: 10,
    },
    demoBtn: {
      borderWidth: 1, borderColor: "rgba(212,175,55,0.4)",
      borderRadius: 10, padding: 12,
      flexDirection: "row",
      alignItems: "center", justifyContent: "center", gap: 8,
      marginBottom: 16,
    },
    demoBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14, color: colors.goldPrimary,
    },
    hintBox: {
      backgroundColor: colors.navyDeep,
      borderRadius: 8, padding: 12,
      borderWidth: 1, borderColor: colors.goldBorder,
    },
    hintTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12, color: colors.ivoryDim,
      marginBottom: 4,
    },
    hintText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12, color: "rgba(250,250,240,0.4)",
    },
  });
}
