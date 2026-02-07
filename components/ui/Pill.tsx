interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: string;
  activeColor?: string;
}

export function Pill({ label, active, onClick, icon, activeColor }: PillProps) {
  const bgActive = activeColor ?? "#2D3B36";
  return (
    <button
      className="px-4 py-2 rounded-full text-[13px] font-semibold border-none whitespace-nowrap transition-all"
      style={{
        background: active ? bgActive : "rgba(45, 59, 54, 0.07)",
        color: active ? "#fff" : "#4A5D55",
      }}
      onClick={onClick}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  );
}
