import type { MedicineFormat } from "./types";
import { FORMATS, SYMPTOM_CATEGORIES } from "./constants";

interface AIRecognitionResult {
  name: string;
  principioAttivo: string;
  formato: MedicineFormat;
  sintomi: string[];
  note: string;
}

function compressImage(base64Image: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_SIZE = 800;
      let { width, height } = img;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non supportato"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error("Errore nel caricare l'immagine"));
    img.src = base64Image;
  });
}

export async function recognizeMedicineFromPhoto(
  base64Image: string
): Promise<AIRecognitionResult> {
  const compressed = await compressImage(base64Image);

  const match = compressed.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) throw new Error("Formato immagine non valido");

  const mimeType = match[1];
  const base64Data = match[2];

  const response = await fetch("/api/recognize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mimeType, base64Data }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Errore server: ${response.status}`);
  }

  const data = await response.json();

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Nessuna risposta dall'AI");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Risposta non valida dall'AI");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const formato = FORMATS.includes(parsed.formato) ? parsed.formato : "Altro";

  const validIds = SYMPTOM_CATEGORIES.map((s) => s.id);
  const sintomi = (parsed.sintomiIds ?? []).filter((id: string) =>
    validIds.includes(id)
  );

  return {
    name: parsed.nome ?? "",
    principioAttivo: parsed.principioAttivo ?? "",
    formato: formato as MedicineFormat,
    sintomi,
    note: parsed.note ?? "",
  };
}
