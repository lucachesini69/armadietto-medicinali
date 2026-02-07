"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Header } from "@/components/layout/Header";
import {
  ChevronLeftIcon,
  EditIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@/components/icons/Icons";
import { getExpiryStatus } from "@/lib/utils";
import { SYMPTOM_CATEGORIES } from "@/lib/constants";
import type { Medicine } from "@/lib/types";

interface MedicineDetailProps {
  medicine: Medicine;
  onBack: () => void;
  onEdit: (med: Medicine) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export function MedicineDetail({
  medicine,
  onBack,
  onEdit,
  onDelete,
  onUpdateQuantity,
}: MedicineDetailProps) {
  const expiryStatus = getExpiryStatus(medicine.scadenza);

  const matchedSymptoms = SYMPTOM_CATEGORIES.filter((cat) =>
    medicine.sintomi.includes(cat.id)
  );

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare "${medicine.name}"?`
    );
    if (confirmed) {
      onDelete(medicine.id);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header
        title="Dettaglio"
        left={
          <button
            onClick={onBack}
            className="bg-transparent border-none cursor-pointer p-1 text-text"
          >
            <ChevronLeftIcon />
          </button>
        }
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(medicine)}
              className="bg-transparent border-none cursor-pointer p-1 text-text"
            >
              <EditIcon />
            </button>
            <button
              onClick={handleDelete}
              className="bg-transparent border-none cursor-pointer p-1 text-danger"
            >
              <TrashIcon />
            </button>
          </div>
        }
      />

      <div className="px-5 pb-[100px]">
        {/* Main Card - Name & Active Ingredient */}
        <Card className="flex flex-col items-center text-center py-6">
          <span className="text-5xl mb-3">💊</span>
          <h1 className="text-[22px] font-extrabold text-text-dark leading-tight">
            {medicine.name}
          </h1>
          <p className="text-[14px] text-text-secondary mt-1">
            {medicine.principioAttivo}
          </p>
        </Card>

        {/* Quantity Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Quantità
              </span>
              <ProgressBar
                value={medicine.quantita}
                max={medicine.quantitaTotale}
                className="w-[120px] !h-1.5"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateQuantity(medicine.id, -1)}
                className="w-9 h-9 rounded-full border border-text/15 bg-transparent flex items-center justify-center cursor-pointer text-text-secondary hover:bg-bg-dark transition-colors"
              >
                <MinusIcon size={16} />
              </button>
              <span className="text-2xl font-extrabold text-text-dark min-w-[32px] text-center">
                {medicine.quantita}
              </span>
              <button
                onClick={() => onUpdateQuantity(medicine.id, 1)}
                className="w-9 h-9 rounded-full border border-text/15 bg-transparent flex items-center justify-center cursor-pointer text-text-secondary hover:bg-bg-dark transition-colors"
              >
                <PlusIcon size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="!mb-0">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Scadenza
            </span>
            <p
              className="text-[14px] font-bold mt-1"
              style={{ color: expiryStatus.color }}
            >
              {expiryStatus.label}
            </p>
          </Card>

          <Card className="!mb-0">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Formato
            </span>
            <p className="text-[14px] font-bold text-text-dark mt-1">
              {medicine.formato}
            </p>
          </Card>

          <Card className="!mb-0">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Posizione
            </span>
            <p className="text-[14px] font-bold text-text-dark mt-1">
              {medicine.posizione}
            </p>
          </Card>

          <Card className="!mb-0">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
              Tot. confezione
            </span>
            <p className="text-[14px] font-bold text-text-dark mt-1">
              {medicine.quantitaTotale}
            </p>
          </Card>
        </div>

        {/* Symptoms Section */}
        {matchedSymptoms.length > 0 && (
          <Card className="mt-3">
            <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
              Indicato per
            </span>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {matchedSymptoms.map((symptom) => (
                <Badge
                  key={symptom.id}
                  label={`${symptom.icon} ${symptom.label}`}
                  color="#3A7D6E"
                />
              ))}
            </div>
          </Card>
        )}

        {/* Notes Section */}
        {medicine.note && (
          <Card className="mt-0">
            <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
              Note
            </span>
            <p className="text-[14px] text-text mt-2 leading-relaxed whitespace-pre-wrap">
              {medicine.note}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
