import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: string;
}

export function Card({ children, className = "", onClick, gradient }: CardProps) {
  return (
    <div
      className={`bg-card rounded-2xl p-4 mb-3 shadow-sm border border-text/6 ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
      style={gradient ? { background: gradient } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
