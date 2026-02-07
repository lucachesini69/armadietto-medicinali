interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="text-center py-10 text-text-muted">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="font-semibold text-base mb-1">{title}</div>
      <div className="text-sm">{subtitle}</div>
    </div>
  );
}
