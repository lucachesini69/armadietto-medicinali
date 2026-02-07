import type { SymptomCategory, MedicineFormat, MedicineLocation } from "./types";

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { id: "dolore", label: "Dolore", icon: "\u{1F915}", keywords: ["dolore", "mal di testa", "cefalea", "emicrania", "nevralgia"] },
  { id: "febbre", label: "Febbre", icon: "\u{1F321}\uFE0F", keywords: ["febbre", "temperatura", "influenza"] },
  { id: "stomaco", label: "Stomaco", icon: "\u{1F922}", keywords: ["stomaco", "nausea", "digestione", "acidit\u00e0", "reflusso", "diarrea"] },
  { id: "allergia", label: "Allergia", icon: "\u{1F927}", keywords: ["allergia", "rinite", "orticaria", "prurito", "starnuti"] },
  { id: "tosse", label: "Tosse/Raffreddore", icon: "\u{1F637}", keywords: ["tosse", "raffreddore", "gola", "catarro", "sinusite"] },
  { id: "pelle", label: "Pelle", icon: "\u{1FA79}", keywords: ["pelle", "ferita", "scottatura", "irritazione", "eczema"] },
  { id: "muscoli", label: "Muscoli/Articolazioni", icon: "\u{1F4AA}", keywords: ["muscoli", "articolazioni", "schiena", "cervicale", "contrattura"] },
  { id: "occhi", label: "Occhi", icon: "\u{1F441}\uFE0F", keywords: ["occhi", "congiuntivite", "secchezza", "collirio"] },
  { id: "altro", label: "Altro", icon: "\u{1F48A}", keywords: ["vitamine", "integratori", "generico"] },
];

export const FORMATS: MedicineFormat[] = [
  "Compresse", "Capsule", "Sciroppo", "Gocce", "Crema/Pomata",
  "Supposte", "Collirio", "Spray", "Bustine", "Fiale", "Cerotti", "Altro",
];

export const LOCATIONS: MedicineLocation[] = [
  "Ripiano alto", "Ripiano medio", "Ripiano basso", "Frigo", "Cassetto", "Altro",
];

export const FAMILY_COLORS = [
  "#4A90A4", "#6B8E5A", "#C4956A", "#9B7CB8", "#D4768C", "#5B9BD5",
];
