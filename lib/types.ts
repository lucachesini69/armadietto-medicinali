export type MedicineFormat =
  | "Compresse" | "Capsule" | "Sciroppo" | "Gocce" | "Crema/Pomata"
  | "Supposte" | "Collirio" | "Spray" | "Bustine" | "Fiale" | "Cerotti" | "Altro";

export type MedicineLocation =
  | "Ripiano alto" | "Ripiano medio" | "Ripiano basso" | "Frigo" | "Cassetto" | "Altro";

export type ReminderFrequency =
  | "Ogni giorno" | "Ogni 8 ore" | "Ogni 12 ore" | "Al bisogno" | "Lun-Ven" | "1 volta/settimana";

export interface Medicine {
  id: string;
  name: string;
  principioAttivo: string;
  formato: MedicineFormat;
  quantita: number;
  quantitaTotale: number;
  scadenza: string; // YYYY-MM-DD
  posizione: MedicineLocation;
  sintomi: string[];
  note: string;
  foto?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  memberId: string;
  orario: string;
  frequenza: ReminderFrequency;
  attivo: boolean;
  createdAt: string;
}

export interface IntakeLog {
  id: string;
  reminderId: string;
  memberId: string;
  medicineName: string;
  takenAt: string;
  skipped: boolean;
  note?: string;
}

export interface ExpiryStatus {
  label: string;
  color: string;
  urgency: number;
}

export interface SymptomCategory {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}
