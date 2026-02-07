"use client";

import { useState, useRef, useCallback } from "react";
import { Pill } from "@/components/ui/Pill";
import { Header } from "@/components/layout/Header";
import { BarcodeScanner } from "@/components/ui/BarcodeScanner";
import { ChevronLeftIcon } from "@/components/icons/Icons";
import { FORMATS, LOCATIONS, SYMPTOM_CATEGORIES } from "@/lib/constants";
import { recognizeMedicineFromPhoto } from "@/lib/ai";
import type { Medicine, MedicineFormat, MedicineLocation } from "@/lib/types";

interface MedicineFormProps {
  medicine?: Medicine;
  onSave: (data: Omit<Medicine, "id" | "createdAt" | "updatedAt"> | Medicine) => void;
  onCancel: () => void;
}

export function MedicineForm({ medicine, onSave, onCancel }: MedicineFormProps) {
  const [form, setForm] = useState({
    name: medicine?.name ?? "",
    principioAttivo: medicine?.principioAttivo ?? "",
    formato: medicine?.formato ?? ("Compresse" as MedicineFormat),
    quantita: medicine?.quantita ?? 0,
    quantitaTotale: medicine?.quantitaTotale ?? 20,
    scadenza: medicine?.scadenza ?? "",
    posizione: medicine?.posizione ?? ("Ripiano medio" as MedicineLocation),
    sintomi: medicine?.sintomi ?? ([] as string[]),
    note: medicine?.note ?? "",
    foto: medicine?.foto ?? "",
    barcode: medicine?.barcode ?? "",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeScan = useCallback((code: string) => {
    setForm((prev) => ({ ...prev, barcode: code }));
    setShowBarcodeScanner(false);
  }, []);

  const inputClass =
    "w-full py-3 px-3.5 rounded-xl border-[1.5px] border-text/12 text-[15px] bg-[#F7FAF9] text-text outline-none focus:border-primary transition-colors font-[inherit]";
  const labelClass = "block text-[13px] font-semibold text-text-secondary mb-1.5";

  function toggleSymptom(symptomId: string) {
    setForm((prev) => ({
      ...prev,
      sintomi: prev.sintomi.includes(symptomId)
        ? prev.sintomi.filter((s) => s !== symptomId)
        : [...prev.sintomi, symptomId],
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, foto: result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleAIRecognition() {
    if (!form.foto) return;
    setAiLoading(true);
    setAiError("");
    try {
      const result = await recognizeMedicineFromPhoto(form.foto);
      if (result.name) {
        setForm((prev) => ({
          ...prev,
          name: result.name || prev.name,
          principioAttivo: result.principioAttivo || prev.principioAttivo,
          formato: result.formato || prev.formato,
          sintomi: result.sintomi.length > 0 ? result.sintomi : prev.sintomi,
          note: result.note || prev.note,
        }));
      } else {
        setAiError("Non sono riuscito a riconoscere il medicinale dalla foto.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      console.error("[AI] Errore:", msg);
      setAiError(`Errore: ${msg}. Riprova o compila manualmente.`);
    } finally {
      setAiLoading(false);
    }
  }

  function handleSave() {
    const saveData = {
      ...form,
      foto: form.foto || undefined,
    };
    if (medicine) {
      onSave({
        ...medicine,
        ...saveData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onSave(saveData);
    }
  }

  const isDisabled = !form.name || !form.scadenza;

  return (
    <div className="min-h-screen bg-bg">
      <Header
        title={medicine ? "Modifica" : "Nuovo farmaco"}
        left={
          <button
            className="w-8 h-8 flex items-center justify-center text-text"
            onClick={onCancel}
          >
            <ChevronLeftIcon />
          </button>
        }
        right={<div className="w-8" />}
      />

      <div className="px-5 pb-[120px]">
        {/* Foto + AI Recognition */}
        <div className="mb-5">
          <label className={labelClass}>Foto medicinale</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />

          {form.foto ? (
            <div className="relative">
              <img
                src={form.foto}
                alt="Foto medicinale"
                className="w-full h-48 object-contain rounded-xl bg-white border border-text/8"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 px-4 rounded-xl text-[14px] font-bold text-white border-none transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #9B59B6, #8E44AD)" }}
                  onClick={handleAIRecognition}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Analisi in corso..." : "\u{1F916} Riconosci con AI"}
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl text-[14px] font-semibold bg-[rgba(45,59,54,0.07)] text-text-secondary border-none"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, foto: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Rimuovi
                </button>
              </div>
              {aiError && (
                <p className="text-danger text-[13px] mt-2">{aiError}</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="w-full py-8 rounded-xl border-2 border-dashed border-text/15 bg-white/50 text-text-muted text-center transition-colors hover:border-primary/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-3xl mb-2">{"\u{1F4F7}"}</div>
              <div className="text-[14px] font-semibold">Scatta o carica una foto</div>
              <div className="text-[12px] mt-1">L&apos;AI riconoscera&apos; il medicinale</div>
            </button>
          )}
        </div>

        {/* Nome farmaco */}
        <div className="mb-4">
          <label className={labelClass}>Nome farmaco *</label>
          <input
            type="text"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        {/* Principio attivo */}
        <div className="mb-4">
          <label className={labelClass}>Principio attivo</label>
          <input
            type="text"
            className={inputClass}
            value={form.principioAttivo}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, principioAttivo: e.target.value }))
            }
          />
        </div>

        {/* Formato + Posizione */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelClass}>Formato</label>
            <select
              className={`${inputClass} appearance-auto`}
              value={form.formato}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  formato: e.target.value as MedicineFormat,
                }))
              }
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Posizione</label>
            <select
              className={`${inputClass} appearance-auto`}
              value={form.posizione}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  posizione: e.target.value as MedicineLocation,
                }))
              }
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantita + Tot. conf. + Scadenza */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className={labelClass}>Quantita</label>
            <input
              type="number"
              className={inputClass}
              min={0}
              value={form.quantita}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  quantita: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Tot. conf.</label>
            <input
              type="number"
              className={inputClass}
              min={1}
              value={form.quantitaTotale}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  quantitaTotale: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Scadenza *</label>
            <input
              type="date"
              className={inputClass}
              value={form.scadenza}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, scadenza: e.target.value }))
              }
              required
            />
          </div>
        </div>

        {/* Symptoms */}
        <div className="mb-4">
          <label className={labelClass}>Indicato per (sintomi)</label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CATEGORIES.map((cat) => (
              <Pill
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                active={form.sintomi.includes(cat.id)}
                onClick={() => toggleSymptom(cat.id)}
                activeColor="#3A7D6E"
              />
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className={labelClass}>Note</label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder="Dosaggio, avvertenze..."
            value={form.note}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, note: e.target.value }))
            }
          />
        </div>

        {/* Barcode */}
        <div className="mb-6">
          <label className={labelClass}>Codice a barre</label>
          <div className="flex gap-2">
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder="Codice a barre"
              value={form.barcode}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, barcode: e.target.value }))
              }
            />
            <button
              type="button"
              className="py-3 px-4 rounded-xl text-[14px] font-bold text-white border-none shrink-0"
              style={{ background: "linear-gradient(135deg, #4A90A4, #3A7D94)" }}
              onClick={() => setShowBarcodeScanner(true)}
            >
              Scansiona
            </button>
          </div>
          {form.barcode && (
            <div className="text-[12px] text-success mt-1.5 font-semibold">
              Codice: {form.barcode}
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          className="w-full py-3.5 px-6 rounded-xl border-none text-[15px] font-bold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
          disabled={isDisabled}
          onClick={handleSave}
        >
          {medicine ? "Salva modifiche" : "Aggiungi farmaco"}
        </button>
      </div>

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
}
