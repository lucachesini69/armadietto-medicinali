"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { ChevronLeftIcon, TrashIcon } from "@/components/icons/Icons";
import type { Medicine, FamilyMember, Reminder, IntakeLog } from "@/lib/types";

interface RemindersScreenProps {
  reminders: Reminder[];
  medicines: Medicine[];
  members: FamilyMember[];
  intakeLog: IntakeLog[];
  onAddReminder: (data: {
    medicineId: string;
    medicineName: string;
    memberId: string;
    orario: string;
    frequenza: string;
    attivo: boolean;
  }) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onLogIntake: (
    reminderId: string,
    memberId: string,
    medicineName: string,
    skipped: boolean
  ) => void;
}

export function RemindersScreen({
  reminders,
  medicines,
  members,
  intakeLog,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onLogIntake,
}: RemindersScreenProps) {
  const [view, setView] = useState<"list" | "form" | "history">("list");
  const [medicineId, setMedicineId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [orario, setOrario] = useState("08:00");
  const [frequenza, setFrequenza] = useState("Ogni giorno");

  const activeCount = reminders.filter((r) => r.attivo).length;

  const inputClass =
    "w-full py-3 px-3.5 rounded-xl border-[1.5px] border-text/12 text-[15px] bg-[#F7FAF9] text-text outline-none focus:border-primary transition-colors font-[inherit] appearance-auto";
  const labelClass = "block text-[13px] font-semibold text-text-secondary mb-1.5";

  function getMemberById(id: string) {
    return members.find((m) => m.id === id);
  }

  function handleSubmit() {
    const medicine = medicines.find((m) => m.id === medicineId);
    if (!medicineId || !memberId || !medicine) return;
    onAddReminder({
      medicineId,
      medicineName: medicine.name,
      memberId,
      orario,
      frequenza,
      attivo: true,
    });
    setMedicineId("");
    setMemberId("");
    setOrario("08:00");
    setFrequenza("Ogni giorno");
    setView("list");
  }

  // ── LIST VIEW ──
  if (view === "list") {
    return (
      <div className="min-h-screen bg-bg">
        <Header
          title="⏰ Promemoria"
          subtitle={`${activeCount} attivi`}
          right={
            <button
              className="py-2.5 px-4 rounded-xl border-none text-[14px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
              onClick={() => setView("form")}
            >
              + Nuovo
            </button>
          }
        />

        <div className="px-5 pb-[100px]">
          <button
            className="text-info text-[13px] font-semibold px-5 mb-2 underline bg-transparent border-none cursor-pointer"
            onClick={() => setView("history")}
          >
            📋 Storico assunzioni
          </button>

          {reminders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">⏰</div>
              <div className="text-[16px] font-bold text-text mb-1">
                Nessun promemoria
              </div>
              <div className="text-[13px] text-text-muted">
                Aggiungine uno per non dimenticare
              </div>
            </div>
          ) : (
            reminders.map((reminder) => {
              const member = getMemberById(reminder.memberId);
              return (
                <Card
                  key={reminder.id}
                  className={reminder.attivo ? "" : "opacity-50"}
                >
                  <div className="flex items-center gap-3">
                    {/* Left side */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onToggleReminder(reminder.id)}
                    >
                      <div className="font-bold text-[15px] text-text">
                        {reminder.medicineName}
                      </div>
                      <div className="text-[13px] text-text-secondary">
                        <span
                          className="font-semibold"
                          style={{ color: member?.color ?? "#6B7F76" }}
                        >
                          {member?.name ?? "—"}
                        </span>
                        {" · "}
                        {reminder.orario}
                        {" · "}
                        {reminder.frequenza}
                      </div>
                    </div>

                    {/* Toggle switch */}
                    <div
                      className="w-12 h-7 rounded-full relative cursor-pointer transition-colors flex-shrink-0"
                      style={{
                        background: reminder.attivo ? "#6B8E5A" : "#CCD5D0",
                      }}
                      onClick={() => onToggleReminder(reminder.id)}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                        style={{
                          left: reminder.attivo ? "26px" : "4px",
                        }}
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      className="text-danger bg-transparent border-none cursor-pointer p-1 flex-shrink-0"
                      onClick={() => onDeleteReminder(reminder.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Intake buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      className="rounded-lg px-3 py-1.5 text-[12px] font-semibold border-none cursor-pointer"
                      style={{
                        background: "rgba(107, 142, 90, 0.15)",
                        color: "#6B8E5A",
                      }}
                      onClick={() =>
                        onLogIntake(
                          reminder.id,
                          reminder.memberId,
                          reminder.medicineName,
                          false
                        )
                      }
                    >
                      ✓ Preso
                    </button>
                    <button
                      className="rounded-lg px-3 py-1.5 text-[12px] font-semibold border-none cursor-pointer"
                      style={{
                        background: "rgba(220, 53, 69, 0.15)",
                        color: "#DC3545",
                      }}
                      onClick={() =>
                        onLogIntake(
                          reminder.id,
                          reminder.memberId,
                          reminder.medicineName,
                          true
                        )
                      }
                    >
                      ✗ Saltato
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ── FORM VIEW ──
  if (view === "form") {
    const isDisabled = !medicineId || !memberId;

    return (
      <div className="min-h-screen bg-bg">
        <Header
          title="Nuovo promemoria"
          left={
            <button
              className="w-8 h-8 flex items-center justify-center text-text bg-transparent border-none cursor-pointer"
              onClick={() => setView("list")}
            >
              <ChevronLeftIcon />
            </button>
          }
          right={<div className="w-8" />}
        />

        <div className="px-5 pb-[100px]">
          {/* Farmaco */}
          <div className="mb-4">
            <label className={labelClass}>Farmaco</label>
            <select
              className={inputClass}
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
            >
              <option value="">Seleziona un farmaco</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Per chi */}
          <div className="mb-4">
            <label className={labelClass}>Per chi</label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isSelected = memberId === member.id;
                return (
                  <button
                    key={member.id}
                    className="rounded-full px-4 py-2 text-[13px] font-semibold border-none cursor-pointer transition-colors"
                    style={{
                      background: isSelected
                        ? member.color
                        : member.color + "15",
                      color: isSelected ? "#FFFFFF" : member.color,
                    }}
                    onClick={() => setMemberId(member.id)}
                  >
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orario + Frequenza */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className={labelClass}>Orario</label>
              <input
                type="time"
                className={inputClass}
                value={orario}
                onChange={(e) => setOrario(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Frequenza</label>
              <select
                className={inputClass}
                value={frequenza}
                onChange={(e) => setFrequenza(e.target.value)}
              >
                <option value="Ogni giorno">Ogni giorno</option>
                <option value="Ogni 8 ore">Ogni 8 ore</option>
                <option value="Ogni 12 ore">Ogni 12 ore</option>
                <option value="Al bisogno">Al bisogno</option>
                <option value="Lun-Ven">Lun-Ven</option>
                <option value="1 volta/settimana">1 volta/settimana</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            className="w-full py-3.5 px-6 rounded-xl border-none text-[15px] font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
            disabled={isDisabled}
            onClick={handleSubmit}
          >
            Aggiungi promemoria
          </button>
        </div>
      </div>
    );
  }

  // ── HISTORY VIEW ──
  return (
    <div className="min-h-screen bg-bg">
      <Header
        title="Storico assunzioni"
        left={
          <button
            className="w-8 h-8 flex items-center justify-center text-text bg-transparent border-none cursor-pointer"
            onClick={() => setView("list")}
          >
            <ChevronLeftIcon />
          </button>
        }
        right={<div className="w-8" />}
      />

      <div className="px-5 pb-[100px]">
        {intakeLog.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-[14px]">
            Nessuna assunzione registrata
          </div>
        ) : (
          intakeLog.map((log) => {
            const member = getMemberById(log.memberId);
            const date = new Date(log.takenAt);
            const dateStr = date.toLocaleDateString("it-IT");
            const timeStr = date.toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const skippedColor = "#DC3545";
            const takenColor = "#6B8E5A";
            const badgeColor = log.skipped ? skippedColor : takenColor;

            return (
              <Card key={log.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-text">{log.medicineName}</div>
                    <div className="text-[13px] text-text-secondary">
                      <span
                        className="font-semibold"
                        style={{ color: member?.color ?? "#6B7F76" }}
                      >
                        {member?.name ?? "—"}
                      </span>
                      {" · "}
                      {dateStr} {timeStr}
                    </div>
                  </div>
                  <span
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: badgeColor + "18",
                      color: badgeColor,
                    }}
                  >
                    {log.skipped ? "Saltato" : "Preso"}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
