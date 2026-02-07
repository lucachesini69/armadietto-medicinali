import Dexie, { type Table } from "dexie";
import type { Medicine, FamilyMember, Reminder, IntakeLog } from "./types";

class MediCasaDB extends Dexie {
  medicines!: Table<Medicine>;
  familyMembers!: Table<FamilyMember>;
  reminders!: Table<Reminder>;
  intakeLog!: Table<IntakeLog>;

  constructor() {
    super("MediCasaDB");
    this.version(1).stores({
      medicines: "id, name, principioAttivo, scadenza, *sintomi",
      familyMembers: "id, name",
      reminders: "id, medicineId, memberId, attivo",
      intakeLog: "id, reminderId, memberId, takenAt",
    });
  }
}

export const db = new MediCasaDB();
