import React, { createContext, useContext, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiFetch } from "@/lib/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationsContextType = {
  registerForPushNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType>({
  registerForPushNotifications: async () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  async function registerForPushNotifications() {
    if (Platform.OS === "web") return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[PushNotifications] Permission not granted, skipping token registration.");
        return;
      }

      type EasExtra = { eas?: { projectId?: string } };
      const easProjectId: string | undefined =
        Constants.easConfig?.projectId ??
        ((Constants.expoConfig?.extra as EasExtra | undefined)?.eas?.projectId);

      if (!easProjectId) {
        console.warn(
          "[PushNotifications] No EAS project ID found in Constants.easConfig or expoConfig.extra.eas.projectId. " +
          "Push token registration skipped. Run `eas build` or set extra.eas.projectId in app.json to enable push notifications."
        );
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: easProjectId });
      const token = tokenData.data;

      const res = await apiFetch("/api/push/register", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        console.warn("[PushNotifications] Server rejected token registration:", res.status);
      }
    } catch (err) {
      console.error("[PushNotifications] Failed to register push token:", err);
    }
  }

  return (
    <NotificationsContext.Provider value={{ registerForPushNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
