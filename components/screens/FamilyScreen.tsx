"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { TrashIcon } from "@/components/icons/Icons";
import type { FamilyMember, Reminder } from "@/lib/types";

interface FamilyScreenProps {
  members: FamilyMember[];
  reminders: Reminder[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
}

export function FamilyScreen({
  members,
  reminders,
  onAddMember,
  onRemoveMember,
}: FamilyScreenProps) {
  const [newName, setNewName] = useState("");
  const [warning, setWarning] = useState("");

  const activeRemindersByMember = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reminders) {
      if (r.attivo) {
        map.set(r.memberId, (map.get(r.memberId) ?? 0) + 1);
      }
    }
    return map;
  }, [reminders]);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setNewName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header
        title="👨‍👩‍👧‍👦 Famiglia"
        subtitle={`${members.length} membri`}
      />

      <div className="px-5 pb-[100px]">
        {warning && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-warning/15 text-warning text-[13px] font-semibold">
            ⚠️ {warning}
          </div>
        )}

        {members.map((member) => (
          <Card key={member.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xl"
                  style={{
                    backgroundColor: member.color + "20",
                    color: member.color,
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-base text-text-dark">
                  {member.name}
                </span>
              </div>

              <button
                className="text-danger p-2"
                onClick={() => {
                  const count = activeRemindersByMember.get(member.id) ?? 0;
                  if (count > 0) {
                    setWarning(`${member.name} ha ${count} promemoria attivo/i. Eliminali prima di rimuovere il membro.`);
                    setTimeout(() => setWarning(""), 4000);
                  } else {
                    onRemoveMember(member.id);
                  }
                }}
              >
                <TrashIcon />
              </button>
            </div>
          </Card>
        ))}

        <Card>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nome nuovo membro..."
              className="flex-1 py-3 px-3.5 rounded-xl border-[1.5px] border-text/12 text-[15px] bg-[#F7FAF9] text-text outline-none focus:border-primary transition-colors font-[inherit]"
            />
            <button
              onClick={handleAdd}
              className="w-auto py-3 px-5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-[15px]"
            >
              + Aggiungi
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
