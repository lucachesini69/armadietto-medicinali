"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { exportData, importData, downloadJson } from "@/lib/backup";

interface SettingsScreenProps {
  isDark: boolean;
  onToggleDark: () => void;
  onShowToast: (message: string) => void;
  notifPermission: NotificationPermission;
  onRequestNotifPermission: () => Promise<NotificationPermission>;
}

export function SettingsScreen({
  isDark,
  onToggleDark,
  onShowToast,
  notifPermission,
  onRequestNotifPermission,
}: SettingsScreenProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportData();
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(json, `medicasa-backup-${date}.json`);
      onShowToast("Backup esportato!");
    } catch (err) {
      console.error("Export error:", err);
      onShowToast("Errore durante l'esportazione");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const counts = await importData(text);
      onShowToast(
        `Importati: ${counts.medicines} farmaci, ${counts.familyMembers} membri, ${counts.reminders} promemoria`
      );
    } catch (err) {
      console.error("Import error:", err);
      onShowToast("Errore: file di backup non valido");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a1a2e]">
      <Header title="Impostazioni" />

      <div className="px-5 pb-[100px]">
        {/* Dark Mode */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-text dark:text-white">
                Tema scuro
              </div>
              <div className="text-[13px] text-text-muted dark:text-white/50">
                {isDark ? "Attivo" : "Disattivo"}
              </div>
            </div>
            <div
              className="w-12 h-7 rounded-full relative cursor-pointer transition-colors flex-shrink-0"
              style={{
                background: isDark ? "#6B8E5A" : "#CCD5D0",
              }}
              onClick={onToggleDark}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                style={{
                  left: isDark ? "26px" : "4px",
                }}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-text dark:text-white">
                Notifiche promemoria
              </div>
              <div className="text-[13px] text-text-muted dark:text-white/50">
                {notifPermission === "granted"
                  ? "Attive"
                  : notifPermission === "denied"
                  ? "Bloccate dal browser"
                  : "Non attive"}
              </div>
            </div>
            {notifPermission === "granted" ? (
              <span className="text-success text-[14px] font-bold">Attive</span>
            ) : notifPermission === "denied" ? (
              <span className="text-danger text-[13px] font-semibold">Bloccate</span>
            ) : (
              <button
                className="py-2.5 px-4 rounded-xl text-[14px] font-bold text-white border-none"
                style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
                onClick={async () => {
                  const result = await onRequestNotifPermission();
                  onShowToast(
                    result === "granted"
                      ? "Notifiche attivate!"
                      : "Permesso notifiche negato"
                  );
                }}
              >
                Attiva
              </button>
            )}
          </div>
        </Card>

        {/* Export */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-text dark:text-white">
                Esporta dati
              </div>
              <div className="text-[13px] text-text-muted dark:text-white/50">
                Scarica un backup JSON
              </div>
            </div>
            <button
              className="py-2.5 px-4 rounded-xl text-[14px] font-bold text-white border-none disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "..." : "Esporta"}
            </button>
          </div>
        </Card>

        {/* Import */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-text dark:text-white">
                Importa dati
              </div>
              <div className="text-[13px] text-text-muted dark:text-white/50">
                Ripristina da un backup JSON
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              className="py-2.5 px-4 rounded-xl text-[14px] font-bold text-white border-none disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #4A90A4, #3A7D94)" }}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "..." : "Importa"}
            </button>
          </div>
        </Card>

        {/* Warning */}
        <div className="mt-4 px-3 text-[12px] text-text-muted dark:text-white/40 text-center leading-relaxed">
          L&apos;importazione sovrascrive tutti i dati esistenti.
          <br />
          Esporta sempre un backup prima di importare.
        </div>

        {/* App info */}
        <div className="mt-8 text-center">
          <div className="text-[18px] font-bold text-text dark:text-white">
            MediCasa
          </div>
          <div className="text-[13px] text-text-muted dark:text-white/40 mt-1">
            Versione 1.0 &middot; Dati salvati localmente
          </div>
        </div>
      </div>
    </div>
  );
}
