"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { ChevronLeftIcon } from "@/components/icons/Icons";
import { getExpiryStatus } from "@/lib/utils";
import type { Medicine } from "@/lib/types";

interface ShoppingListScreenProps {
  medicines: Medicine[];
  onBack: () => void;
}

interface ShoppingItem {
  medicine: Medicine;
  reason: "expired" | "low_stock";
  reasonLabel: string;
  reasonColor: string;
}

export function ShoppingListScreen({ medicines, onBack }: ShoppingListScreenProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const checkedSet = useMemo(() => new Set(checkedIds), [checkedIds]);

  const shoppingItems = useMemo<ShoppingItem[]>(() => {
    const items: ShoppingItem[] = [];

    for (const med of medicines) {
      const expiryStatus = getExpiryStatus(med.scadenza);
      if (expiryStatus.urgency === 3) {
        items.push({
          medicine: med,
          reason: "expired",
          reasonLabel: "Scaduto",
          reasonColor: "#DC3545",
        });
        continue;
      }

      if (med.quantitaTotale > 0 && med.quantita / med.quantitaTotale <= 0.25) {
        items.push({
          medicine: med,
          reason: "low_stock",
          reasonLabel: "In esaurimento",
          reasonColor: "#E8853D",
        });
      }
    }

    return items;
  }, [medicines]);

  const uncheckedCount = useMemo(
    () => shoppingItems.filter((item) => !checkedSet.has(item.medicine.id)).length,
    [shoppingItems, checkedSet]
  );

  const hasChecked = checkedIds.length > 0;

  const toggleCheck = useCallback((id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleShare = useCallback(async () => {
    const lines = shoppingItems
      .filter((item) => !checkedSet.has(item.medicine.id))
      .map(
        (item) =>
          `- ${item.medicine.name} (${item.reason === "expired" ? "scaduto" : "in esaurimento"})`
      );

    const text = `Lista della spesa MediCasa:\n${lines.join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Lista copiata negli appunti!");
      } catch {
        alert("Impossibile condividere la lista.");
      }
    }
  }, [shoppingItems, checkedSet]);

  const clearChecked = useCallback(() => {
    setCheckedIds([]);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Header
        title="🛒 Lista della spesa"
        subtitle={`${uncheckedCount} da comprare`}
        left={
          <button
            className="w-8 h-8 flex items-center justify-center text-text bg-transparent border-none cursor-pointer"
            onClick={onBack}
          >
            <ChevronLeftIcon />
          </button>
        }
      />

      <div className="px-5 pb-[100px]">
        {shoppingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-[48px] mb-3">🎉</div>
            <div className="text-[18px] font-bold text-text">Tutto a posto!</div>
            <div className="text-[14px] text-text-muted mt-1">
              Non ci sono farmaci da ricomprare
            </div>
          </div>
        ) : (
          <>
            {/* Shopping items */}
            <div>
              {shoppingItems.map((item) => {
                const isChecked = checkedSet.has(item.medicine.id);

                return (
                  <Card
                    key={item.medicine.id}
                    onClick={() => toggleCheck(item.medicine.id)}
                    className={isChecked ? "opacity-60" : ""}
                  >
                    <div className="flex items-center">
                      {/* Checkbox circle */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-primary border-primary"
                            : "border-text/20 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <span className="text-white text-[13px] font-bold leading-none">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Medicine info */}
                      <div className="flex-1 ml-3 min-w-0">
                        <div
                          className={`font-semibold text-[15px] truncate ${
                            isChecked
                              ? "line-through text-text-muted"
                              : "text-text"
                          }`}
                        >
                          {item.medicine.name}
                        </div>
                        <div className="mt-1">
                          <Badge
                            label={item.reasonLabel}
                            color={item.reasonColor}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl py-3.5 active:scale-[0.98] transition-transform"
              >
                Condividi lista
              </button>

              {hasChecked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearChecked();
                  }}
                  className="w-full bg-text/7 text-text-secondary font-semibold rounded-xl py-3 mt-2 active:scale-[0.98] transition-transform"
                >
                  Svuota completati
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
