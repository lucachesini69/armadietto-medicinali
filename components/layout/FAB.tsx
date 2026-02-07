"use client";

import { PlusIcon } from "@/components/icons/Icons";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      className="fixed bottom-[90px] right-5 w-14 h-14 rounded-full text-white border-none flex items-center justify-center z-40 transition-transform hover:scale-110 active:scale-95 shadow-fab"
      style={{ background: "linear-gradient(135deg, #3A7D6E, #2D6356)" }}
      onClick={onClick}
      title="Aggiungi farmaco"
    >
      <PlusIcon />
    </button>
  );
}
