"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

function getErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("permission") || lower.includes("notallowed") || lower.includes("not allowed")) {
    return "Permesso fotocamera negato. Vai nelle impostazioni del browser e consenti l'accesso alla fotocamera per questo sito.";
  }
  if (lower.includes("notfound") || lower.includes("not found") || lower.includes("requested device not found")) {
    return "Nessuna fotocamera trovata sul dispositivo.";
  }
  if (lower.includes("notreadable") || lower.includes("not readable") || lower.includes("could not start")) {
    return "La fotocamera e' in uso da un'altra app. Chiudi le altre app che usano la fotocamera e riprova.";
  }
  if (lower.includes("overconstrained")) {
    return "La fotocamera posteriore non e' disponibile. Riprova.";
  }
  if (lower.includes("secure context") || lower.includes("https")) {
    return "La fotocamera richiede una connessione sicura (HTTPS). Apri il sito tramite HTTPS.";
  }
  return `Errore fotocamera: ${msg}`;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const html5QrCodeRef = useRef<unknown>(null);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(() => {
    const scanner = html5QrCodeRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
    if (scanner) {
      scanner.stop?.().catch(() => {});
      scanner.clear?.();
      html5QrCodeRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setError("");
    setLoading(true);

    // Check HTTPS requirement (camera requires secure context)
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setError("La fotocamera richiede una connessione sicura (HTTPS). Apri il sito tramite HTTPS.");
      setLoading(false);
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!mountedRef.current || !scannerRef.current) return;

      const scannerId = "barcode-scanner-region";
      scannerRef.current.id = scannerId;

      // Clean up any previous scanner instance
      stopScanner();

      const scanner = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = scanner;

      // Try rear camera first, fall back to any available camera
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 150 } },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch (envErr) {
        // Rear camera failed, try any available camera
        await scanner.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 280, height: 150 } },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      }

      if (mountedRef.current) {
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err));
        setLoading(false);
      }
    }
  }, [onScan, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    startScanner();

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      <div className="text-white text-center mb-4">
        <div className="text-[16px] font-bold">Scansiona il codice a barre</div>
        <div className="text-[13px] text-white/60 mt-1">
          Inquadra il barcode della confezione
        </div>
      </div>

      {error ? (
        <div className="text-center px-8 max-w-[340px]">
          <div className="text-red-400 text-[14px] mb-4 leading-relaxed">{error}</div>
          <div className="flex gap-3 justify-center">
            <button
              className="py-3 px-6 rounded-xl text-[14px] font-bold text-white border-none"
              style={{ background: "linear-gradient(135deg, #4A90A4, #3A7D94)" }}
              onClick={() => startScanner()}
            >
              Riprova
            </button>
            <button
              className="py-3 px-6 rounded-xl text-[14px] font-bold text-white border-none"
              style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
              onClick={onClose}
            >
              Chiudi
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-[320px] h-[240px] rounded-xl overflow-hidden">
          <div ref={scannerRef} className="w-full h-full" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-white/60 text-[14px]">Avvio fotocamera...</div>
            </div>
          )}
        </div>
      )}

      <button
        className="mt-6 py-3 px-8 rounded-xl text-[14px] font-semibold text-white/80 bg-white/10 border-none"
        onClick={() => {
          stopScanner();
          onClose();
        }}
      >
        Annulla
      </button>
    </div>
  );
}
