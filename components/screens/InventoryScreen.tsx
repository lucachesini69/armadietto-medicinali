"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "@/components/layout/Header";
import { SearchIcon } from "@/components/icons/Icons";
import { getExpiryStatus } from "@/lib/utils";
import type { Medicine } from "@/lib/types";

interface InventoryScreenProps {
  medicines: Medicine[];
  onSelectMedicine: (med: Medicine) => void;
}

type SortOption = "A-Z" | "Scadenza" | "Quantità";

export function InventoryScreen({
  medicines,
  onSelectMedicine,
}: InventoryScreenProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("A-Z");

  const sortOptions: SortOption[] = ["A-Z", "Scadenza", "Quantità"];

  const filtered = medicines.filter((med) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      med.name.toLowerCase().includes(q) ||
      med.principioAttivo.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "A-Z":
        return a.name.localeCompare(b.name, "it");
      case "Scadenza":
        return new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime();
      case "Quantità":
        return a.quantita - b.quantita;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-bg">
      <Header
        title="💊 Inventario"
        subtitle={`${medicines.length} medicinali totali`}
      />

      <div className="px-5 pb-[100px]">
        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Cerca per nome o principio attivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-[1.5px] border-text/12 text-[15px] bg-[#F7FAF9] text-text outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Sort pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {sortOptions.map((option) => (
            <Pill
              key={option}
              label={option}
              active={sortBy === option}
              onClick={() => setSortBy(option)}
            />
          ))}
        </div>

        {/* Medicine cards list */}
        {sorted.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Nessun medicinale trovato"
            subtitle="Prova a modificare la ricerca o aggiungi un nuovo medicinale"
          />
        ) : (
          <div>
            {sorted.map((med) => {
              const expiryStatus = getExpiryStatus(med.scadenza);
              const pct =
                med.quantitaTotale > 0
                  ? (med.quantita / med.quantitaTotale) * 100
                  : 100;
              const isLowStock = pct <= 25;

              return (
                <Card key={med.id} onClick={() => onSelectMedicine(med)}>
                  <div className="flex items-center gap-3">
                    {/* Left side */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-text-dark truncate">
                        {med.name}
                      </div>
                      <div className="text-[13px] text-text-muted mt-0.5 truncate">
                        {med.principioAttivo}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge
                          label={expiryStatus.label}
                          color={expiryStatus.color}
                        />
                        <Badge label={med.formato} color="#4A90A4" />
                        <Badge label={med.posizione} color="#6B7F76" />
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end shrink-0 min-w-[60px]">
                      <div className="flex items-baseline gap-0.5">
                        <span
                          className={`text-[22px] font-bold leading-none ${
                            isLowStock ? "text-warning" : "text-text-dark"
                          }`}
                        >
                          {med.quantita}
                        </span>
                        <span className="text-[12px] text-text-muted">
                          /{med.quantitaTotale}
                        </span>
                      </div>
                      <ProgressBar
                        value={med.quantita}
                        max={med.quantitaTotale}
                        className="w-14 mt-2"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
