import type { ExpiryStatus } from "./types";

export function getExpiryStatus(dateStr: string): ExpiryStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Scaduto", color: "#DC3545", urgency: 3 };
  if (diffDays <= 30) return { label: `Scade tra ${diffDays}g`, color: "#E8853D", urgency: 2 };
  if (diffDays <= 90) return { label: `Scade tra ${Math.ceil(diffDays / 30)} mesi`, color: "#C4956A", urgency: 1 };
  return { label: `Scade il ${formatDate(dateStr)}`, color: "#6B8E5A", urgency: 0 };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}
