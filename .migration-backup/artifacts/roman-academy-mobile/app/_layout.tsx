import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/auth";
import { NotificationsProvider, useNotifications } from "@/context/notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const DEEP_LINK_ROUTES: Record<string, string> = {
  "student/tests": "/(student)/tests",
  "student/leaderboard": "/(student)/leaderboard",
  "teacher/dashboard": "/(teacher)/dashboard",
};

const NOTIFICATION_SCREEN_ROUTES: Record<string, string> = {
  "student-tests": "/(student)/tests",
  "student-leaderboard": "/(student)/leaderboard",
  "teacher-dashboard": "/(teacher)/dashboard",
};

function resolveDeepLink(url: string): string | null {
  const parsed = Linking.parse(url);
  const rawPath = parsed.path ?? "";
  const normalizedPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const target = DEEP_LINK_ROUTES[normalizedPath] ?? null;
  if (!target) {
    console.log("[DeepLink] No route mapped for path:", normalizedPath);
  }
  return target;
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { registerForPushNotifications } = useNotifications();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (user.role === "student") {
      router.replace("/(student)/dashboard");
    } else if (user.role === "teacher") {
      router.replace("/(teacher)/dashboard");
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    registerForPushNotifications();
  }, [user]);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        const target = resolveDeepLink(url);
        if (target) router.push(target as any);
      }
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      const target = resolveDeepLink(url);
      if (target) router.push(target as any);
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      const screen = data?.screen;
      if (screen) {
        const target = NOTIFICATION_SCREEN_ROUTES[screen];
        if (target) {
          router.push(target as any);
        } else {
          console.log("[Notifications] No route mapped for screen key:", screen);
        }
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(teacher)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <NotificationsProvider>
                  <RootLayoutNav />
                </NotificationsProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
