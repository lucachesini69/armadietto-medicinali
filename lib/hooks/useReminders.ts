"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Reminder, IntakeLog } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function useReminders() {
  const reminders = useLiveQuery(() => db.reminders.toArray()) ?? [];
  const intakeLog = useLiveQuery(() =>
    db.intakeLog.orderBy("takenAt").reverse().limit(100).toArray()
  ) ?? [];

  async function addReminder(data: Omit<Reminder, "id" | "createdAt">) {
    const reminder: Reminder = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.reminders.add(reminder);
    return reminder;
  }

  async function toggleReminder(id: string) {
    const reminder = await db.reminders.get(id);
    if (reminder) {
      await db.reminders.update(id, { attivo: !reminder.attivo });
    }
  }

  async function deleteReminder(id: string) {
    await db.reminders.delete(id);
  }

  async function logIntake(
    reminderId: string,
    memberId: string,
    medicineName: string,
    skipped: boolean
  ) {
    const log: IntakeLog = {
      id: generateId(),
      reminderId,
      memberId,
      medicineName,
      takenAt: new Date().toISOString(),
      skipped,
    };
    await db.intakeLog.add(log);
    return log;
  }

  return {
    reminders,
    intakeLog,
    addReminder,
    toggleReminder,
    deleteReminder,
    logIntake,
  };
}
