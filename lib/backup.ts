"use client";

import { db } from "./db";

interface BackupData {
  version: number;
  exportedAt: string;
  medicines: unknown[];
  familyMembers: unknown[];
  reminders: unknown[];
  intakeLog: unknown[];
}

export async function exportData(): Promise<string> {
  const [medicines, familyMembers, reminders, intakeLog] = await Promise.all([
    db.medicines.toArray(),
    db.familyMembers.toArray(),
    db.reminders.toArray(),
    db.intakeLog.toArray(),
  ]);

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    medicines,
    familyMembers,
    reminders,
    intakeLog,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importData(jsonString: string): Promise<{ medicines: number; familyMembers: number; reminders: number; intakeLog: number }> {
  const data: BackupData = JSON.parse(jsonString);

  if (!data.version || !data.medicines || !data.familyMembers) {
    throw new Error("Formato backup non valido");
  }

  // Clear existing data
  await Promise.all([
    db.medicines.clear(),
    db.familyMembers.clear(),
    db.reminders.clear(),
    db.intakeLog.clear(),
  ]);

  // Import data
  const counts = {
    medicines: 0,
    familyMembers: 0,
    reminders: 0,
    intakeLog: 0,
  };

  if (data.medicines.length > 0) {
    await db.medicines.bulkAdd(data.medicines as Parameters<typeof db.medicines.bulkAdd>[0]);
    counts.medicines = data.medicines.length;
  }
  if (data.familyMembers.length > 0) {
    await db.familyMembers.bulkAdd(data.familyMembers as Parameters<typeof db.familyMembers.bulkAdd>[0]);
    counts.familyMembers = data.familyMembers.length;
  }
  if (data.reminders?.length > 0) {
    await db.reminders.bulkAdd(data.reminders as Parameters<typeof db.reminders.bulkAdd>[0]);
    counts.reminders = data.reminders.length;
  }
  if (data.intakeLog?.length > 0) {
    await db.intakeLog.bulkAdd(data.intakeLog as Parameters<typeof db.intakeLog.bulkAdd>[0]);
    counts.intakeLog = data.intakeLog.length;
  }

  return counts;
}

export function downloadJson(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
