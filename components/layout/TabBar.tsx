"use client";

export type TabId = "home" | "inventario" | "promemoria" | "cerca" | "famiglia";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "\u{1F3E0}" },
  { id: "inventario", label: "Inventario", icon: "\u{1F48A}" },
  { id: "promemoria", label: "Promemoria", icon: "\u23F0" },
  { id: "cerca", label: "Cerca", icon: "\u{1F50D}" },
  { id: "famiglia", label: "Famiglia", icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}" },
];

interface TabBarProps {
  tab: TabId;
  setTab: (tab: TabId) => void;
}

export function TabBar({ tab, setTab }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-xl border-t border-text/8 flex justify-around pb-[env(safe-area-inset-bottom,12px)] pt-2 z-50">
      {TABS.map((t) => (
        <button
          key={t.id}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 border-none bg-transparent transition-all"
          style={{
            color: tab === t.id ? "#3A7D6E" : "#8A998F",
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: 11,
          }}
          onClick={() => setTab(t.id)}
        >
          <span className="text-xl">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
