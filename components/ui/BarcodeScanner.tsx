"use client";

import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const html5QrCodeRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted || !scannerRef.current) return;

        const scannerId = "barcode-scanner-region";
        scannerRef.current.id = scannerId;

        const scanner = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
          },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop().catch(() => {});
          },
          () => {
            // Scan failure, ignore (scanning continues)
          }
        );
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : "Errore fotocamera";
          setError(msg);
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      const scanner = html5QrCodeRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (scanner) {
        scanner.stop?.().catch(() => {});
        scanner.clear?.();
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      <div className="text-white text-center mb-4">
        <div className="text-[16px] font-bold">Scansiona il codice a barre</div>
        <div className="text-[13px] text-white/60 mt-1">
          Inquadra il barcode della confezione
        </div>
      </div>

      {error ? (
        <div className="text-center px-8">
          <div className="text-danger text-[14px] mb-4">{error}</div>
          <button
            className="py-3 px-6 rounded-xl text-[14px] font-bold text-white border-none"
            style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
      ) : (
        <div
          ref={scannerRef}
          className="w-[320px] h-[240px] rounded-xl overflow-hidden"
        />
      )}

      <button
        className="mt-6 py-3 px-8 rounded-xl text-[14px] font-semibold text-white/80 bg-white/10 border-none"
        onClick={onClose}
      >
        Annulla
      </button>
    </div>
  );
}
