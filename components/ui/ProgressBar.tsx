interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const color = pct <= 25 ? "#E8853D" : "#3A7D6E";

  return (
    <div className={`h-1 bg-bg-dark rounded-sm ${className}`}>
      <div
        className="h-full rounded-sm transition-all duration-300"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
