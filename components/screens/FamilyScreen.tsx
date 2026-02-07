"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { TrashIcon } from "@/components/icons/Icons";
import type { FamilyMember } from "@/lib/types";

interface FamilyScreenProps {
  members: FamilyMember[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
}

export function FamilyScreen({
  members,
  onAddMember,
  onRemoveMember,
}: FamilyScreenProps) {
  const [newName, setNewName] = useState("");

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
                onClick={() => onRemoveMember(member.id)}
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
