"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { SearchIcon } from "@/components/icons/Icons";
import { SYMPTOM_CATEGORIES } from "@/lib/constants";
import { getExpiryStatus } from "@/lib/utils";
import type { Medicine } from "@/lib/types";

interface SearchScreenProps {
  medicines: Medicine[];
  onSelectMedicine: (med: Medicine) => void;
}

export function SearchScreen({
  medicines,
  onSelectMedicine,
}: SearchScreenProps) {
  const [textSearch, setTextSearch] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  const getFilteredMedicines = (): Medicine[] => {
    if (selectedSymptom) {
      return medicines.filter((med) => med.sintomi.includes(selectedSymptom));
    }

    if (textSearch.trim()) {
      const q = textSearch.toLowerCase().trim();
      return medicines.filter((med) => {
        // Search in name, principioAttivo, note
        if (med.name.toLowerCase().includes(q)) return true;
        if (med.principioAttivo.toLowerCase().includes(q)) return true;
        if (med.note.toLowerCase().includes(q)) return true;

        // Search in symptom category keywords
        for (const symptomId of med.sintomi) {
          const category = SYMPTOM_CATEGORIES.find((c) => c.id === symptomId);
          if (category) {
            for (const keyword of category.keywords) {
              if (keyword.toLowerCase().includes(q)) return true;
            }
          }
        }

        return false;
      });
    }

    return [];
  };

  const filtered = getFilteredMedicines();
  const hasActiveSearch = !!(selectedSymptom || textSearch.trim());

  return (
    <div className="min-h-screen bg-bg">
      <Header title="🔍 Cerca" subtitle="Trova il farmaco giusto" />

      <div className="px-5 pb-[100px]">
        {/* Text search bar */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Cosa hai? es. mal di testa, febbre..."
            value={textSearch}
            onChange={(e) => {
              setTextSearch(e.target.value);
              setSelectedSymptom(null);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-[1.5px] border-text/12 text-[15px] bg-[#F7FAF9] text-text outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Symptom grid */}
        <div className="mb-5">
          <div className="text-[13px] font-semibold text-text-secondary mb-3">
            Oppure seleziona un sintomo
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {SYMPTOM_CATEGORIES.map((cat) => {
              const isSelected = selectedSymptom === cat.id;
              return (
                <Card
                  key={cat.id}
                  className={`!mb-0 !p-3.5 text-center ${
                    isSelected
                      ? "!border-2 !border-primary bg-[#F0F8F5]"
                      : "!border !border-text/6 bg-white"
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSymptom(null);
                    } else {
                      setSelectedSymptom(cat.id);
                      setTextSearch("");
                    }
                  }}
                >
                  <div className="text-[26px] leading-none">{cat.icon}</div>
                  <div
                    className={`text-[12px] font-semibold mt-1.5 ${
                      isSelected ? "text-primary-dark" : "text-text"
                    }`}
                  >
                    {cat.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Results section */}
        {hasActiveSearch && (
          <div>
            <div className="text-[14px] font-semibold text-text-secondary mb-3">
              {filtered.length > 0
                ? `${filtered.length} farmaco/i trovato/i`
                : "Nessun farmaco trovato"}
            </div>

            {filtered.length > 0 ? (
              filtered.map((med) => {
                const expiryStatus = getExpiryStatus(med.scadenza);
                const isExpired = expiryStatus.label === "Scaduto";
                const isDepleted = med.quantita === 0;

                return (
                  <Card
                    key={med.id}
                    className={
                      isExpired || isDepleted ? "opacity-50" : ""
                    }
                    onClick={() => onSelectMedicine(med)}
                  >
                    <div className="text-[15px] font-bold text-text-dark">
                      {med.name}
                    </div>
                    <div className="text-[13px] text-text-secondary mt-0.5">
                      {med.principioAttivo}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge
                        label={expiryStatus.label}
                        color={expiryStatus.color}
                      />
                      <Badge
                        label={`Qtà: ${med.quantita}`}
                        color="#4A90A4"
                      />
                    </div>
                    {med.note && (
                      <div className="text-[12px] text-text-muted mt-2">
                        📝 {med.note}
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card className="text-center !py-8">
                <div className="text-[32px] mb-2">🔍</div>
                <div className="text-[15px] font-semibold text-text-dark">
                  Nessun farmaco per questo sintomo
                </div>
                <div className="text-[13px] text-text-muted mt-1">
                  Prova a cercare in altro modo o aggiungi un farmaco al tuo
                  armadietto
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
