"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { FamilyMember } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { FAMILY_COLORS } from "@/lib/constants";

export function useFamily() {
  const members = useLiveQuery(() => db.familyMembers.toArray()) ?? [];

  async function addMember(name: string) {
    const colorIdx = members.length % FAMILY_COLORS.length;
    const member: FamilyMember = {
      id: generateId(),
      name: name.trim(),
      color: FAMILY_COLORS[colorIdx],
      createdAt: new Date().toISOString(),
    };
    await db.familyMembers.add(member);
    return member;
  }

  async function removeMember(id: string) {
    await db.familyMembers.delete(id);
  }

  return { members, addMember, removeMember };
}
