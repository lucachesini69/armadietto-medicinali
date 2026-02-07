"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { getExpiryStatus, getGreeting } from "@/lib/utils";
import type { Medicine, FamilyMember, Reminder } from "@/lib/types";

interface HomeScreenProps {
  medicines: Medicine[];
  reminders: Reminder[];
  members: FamilyMember[];
  onNavigate: (tab: string) => void;
  onSelectMedicine: (med: Medicine) => void;
}

export function HomeScreen({
  medicines,
  reminders,
  members,
  onNavigate,
  onSelectMedicine,
}: HomeScreenProps) {
  const expiringMedicines = useMemo(() => {
    return medicines
      .map((med) => ({ med, status: getExpiryStatus(med.scadenza) }))
      .filter(({ status }) => status.urgency >= 2)
      .sort((a, b) => b.status.urgency - a.status.urgency)
      .slice(0, 3);
  }, [medicines]);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter(
      (med) => med.quantitaTotale > 0 && med.quantita <= med.quantitaTotale * 0.25
    );
  }, [medicines]);

  const activeReminders = useMemo(() => {
    return reminders.filter((r) => r.attivo);
  }, [reminders]);

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-bg">
      <Header
        title="🏥 MediCasa"
        subtitle={`${greeting}! Hai ${medicines.length} medicinali`}
        right={
          <button
            className="w-8 h-8 flex items-center justify-center text-text-secondary text-xl bg-transparent border-none cursor-pointer"
            onClick={() => onNavigate("settings")}
          >
            ⚙️
          </button>
        }
      />

      <div className="px-5 pb-[100px]">
        {/* Expiry Alerts */}
        {expiringMedicines.length > 0 && (
          <Card
            gradient="linear-gradient(135deg, #FFF5F0, #FFF0EA)"
            className="!mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚠️</span>
              <h2 className="text-[15px] font-bold text-text-dark">
                Avvisi scadenza
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {expiringMedicines.map(({ med, status }) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2.5 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => onSelectMedicine(med)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-text-dark truncate">
                      {med.name}
                    </div>
                    <div className="text-[12px] text-text-muted mt-0.5">
                      {med.formato} &middot; {med.posizione}
                    </div>
                  </div>
                  <Badge label={status.label} color={status.color} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Low Stock */}
        {lowStockMedicines.length > 0 && (
          <Card
            gradient="linear-gradient(135deg, #FFF8F0, #FFF5EA)"
            className="!mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📦</span>
              <h2 className="text-[15px] font-bold text-text-dark">
                In esaurimento
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {lowStockMedicines.map((med) => {
                const pct =
                  med.quantitaTotale > 0
                    ? Math.round((med.quantita / med.quantitaTotale) * 100)
                    : 0;

                return (
                  <div
                    key={med.id}
                    className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2.5 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => onSelectMedicine(med)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-text-dark truncate">
                        {med.name}
                      </div>
                      <div className="text-[12px] text-text-muted mt-0.5">
                        {med.quantita} / {med.quantitaTotale} rimasti
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-warning">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Today's Reminders */}
        {activeReminders.length > 0 && (
          <Card
            gradient="linear-gradient(135deg, #F0F4FF, #E8EEFF)"
            className="!mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⏰</span>
              <h2 className="text-[15px] font-bold text-text-dark">
                Promemoria di oggi
              </h2>
              <span className="ml-auto text-[12px] font-bold text-info bg-info/10 px-2 py-0.5 rounded-full">
                {activeReminders.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeReminders.slice(0, 4).map((reminder) => {
                const member = members.find((m) => m.id === reminder.memberId);
                return (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-text-dark truncate">
                        {reminder.medicineName}
                      </div>
                      <div className="text-[12px] text-text-muted mt-0.5">
                        <span
                          className="font-semibold"
                          style={{ color: member?.color ?? "#6B7F76" }}
                        >
                          {member?.name ?? "—"}
                        </span>
                        {" · "}
                        {reminder.orario}
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {reminder.frequenza}
                    </span>
                  </div>
                );
              })}
            </div>

            {activeReminders.length > 4 && (
              <button
                className="mt-2 text-[13px] font-semibold text-info bg-transparent border-none cursor-pointer"
                onClick={() => onNavigate("promemoria")}
              >
                Vedi tutti ({activeReminders.length})
              </button>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Card
            className="!mb-0 flex flex-col items-center justify-center py-5"
            onClick={() => onNavigate("inventario")}
          >
            <span className="text-3xl mb-2">💊</span>
            <span className="text-[14px] font-semibold text-text-dark">
              Inventario
            </span>
            <span className="text-[12px] text-text-muted mt-0.5">
              {medicines.length} medicinali
            </span>
          </Card>

          <Card
            className="!mb-0 flex flex-col items-center justify-center py-5"
            onClick={() => onNavigate("cerca")}
          >
            <span className="text-3xl mb-2">🔍</span>
            <span className="text-[14px] font-semibold text-text-dark">
              Cerca
            </span>
            <span className="text-[12px] text-text-muted mt-0.5">
              Per sintomo o nome
            </span>
          </Card>

          <Card
            className="!mb-0 flex flex-col items-center justify-center py-5"
            onClick={() => onNavigate("promemoria")}
          >
            <span className="text-3xl mb-2">⏰</span>
            <span className="text-[14px] font-semibold text-text-dark">
              Promemoria
            </span>
            <span className="text-[12px] text-text-muted mt-0.5">
              {activeReminders.length} attivi
            </span>
          </Card>

          <Card
            className="!mb-0 flex flex-col items-center justify-center py-5"
            onClick={() => onNavigate("shopping")}
          >
            <span className="text-3xl mb-2">🛒</span>
            <span className="text-[14px] font-semibold text-text-dark">
              Lista spesa
            </span>
            <span className="text-[12px] text-text-muted mt-0.5">
              Da ricomprare
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}
