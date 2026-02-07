"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Reminder, FamilyMember } from "@/lib/types";

export function useNotifications(
  reminders: Reminder[],
  members: FamilyMember[]
) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    function checkReminders() {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().slice(0, 10);
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

      for (const reminder of reminders) {
        if (!reminder.attivo) continue;
        if (reminder.orario !== currentTime) continue;

        // Check frequency
        if (reminder.frequenza === "Lun-Ven" && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
        if (reminder.frequenza === "1 volta/settimana" && dayOfWeek !== 1) continue;

        const notifKey = `${reminder.id}-${today}-${currentTime}`;
        if (notifiedRef.current.has(notifKey)) continue;
        notifiedRef.current.add(notifKey);

        const member = members.find((m) => m.id === reminder.memberId);
        const memberName = member?.name ?? "";

        const notification = new Notification(`💊 ${reminder.medicineName}`, {
          body: `${memberName} — ${reminder.orario} (${reminder.frequenza})`,
          icon: "/icons/icon-192.png",
          tag: notifKey,
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }

    // Check immediately
    checkReminders();

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [permission, reminders, members]);

  // Cleanup old notification keys daily
  useEffect(() => {
    const cleanup = setInterval(() => {
      notifiedRef.current.clear();
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  return { permission, requestPermission };
}
