import { type ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function Header({ title, subtitle, left, right }: HeaderProps) {
  return (
    <div className="px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-50 bg-bg/92 backdrop-blur-xl">
      {left ?? <div />}
      <div className={left ? "text-center flex-1" : ""}>
        <div className="text-[22px] font-bold tracking-tight text-text-dark">{title}</div>
        {subtitle && <div className="text-[13px] font-medium text-text-secondary">{subtitle}</div>}
      </div>
      {right ?? <div className="w-8" />}
    </div>
  );
}
