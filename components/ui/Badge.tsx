interface BadgeProps {
  label: string;
  color: string;
  className?: string;
}

export function Badge({ label, color, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${className}`}
      style={{ background: color + "18", color }}
    >
      {label}
    </span>
  );
}
