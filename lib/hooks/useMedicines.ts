"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Medicine } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function useMedicines() {
  const medicines = useLiveQuery(() => db.medicines.toArray()) ?? [];

  async function addMedicine(data: Omit<Medicine, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const medicine: Medicine = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.medicines.add(medicine);
    return medicine;
  }

  async function updateMedicine(id: string, data: Partial<Medicine>) {
    await db.medicines.update(id, { ...data, updatedAt: new Date().toISOString() });
  }

  async function deleteMedicine(id: string) {
    await db.medicines.delete(id);
  }

  async function updateQuantity(id: string, delta: number) {
    const med = await db.medicines.get(id);
    if (med) {
      const newQty = Math.max(0, med.quantita + delta);
      await db.medicines.update(id, { quantita: newQty, updatedAt: new Date().toISOString() });
    }
  }

  return { medicines, addMedicine, updateMedicine, deleteMedicine, updateQuantity };
}
