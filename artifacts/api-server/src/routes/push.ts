import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.post("/push/register", requireAuth, async (req: any, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Push token is required" });
    }

    const userId = req.session.userId as string;

    await db
      .update(usersTable)
      .set({ pushToken: token, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    logger.info({ userId }, "Push token registered");
    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Push token registration error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const message = {
      to: expoPushToken,
      sound: "default" as const,
      title,
      body,
      data: data || {},
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.warn({ status: response.status, body: text }, "Expo push send failed");
    } else {
      const result = await response.json();
      logger.info({ result }, "Expo push notification sent");
    }
  } catch (err) {
    logger.error({ err }, "Error sending push notification");
  }
}
