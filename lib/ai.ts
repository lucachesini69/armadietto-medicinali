import type { MedicineFormat } from "./types";
import { FORMATS, SYMPTOM_CATEGORIES } from "./constants";

const GEMINI_API_KEY = "AIzaSyAg21nb-qNdqL9DuPSgSWWNR4PX85-h60o";

interface AIRecognitionResult {
  name: string;
  principioAttivo: string;
  formato: MedicineFormat;
  sintomi: string[];
  note: string;
}

/**
 * Compresses an image to reduce its size before sending to the API.
 * Returns a base64 JPEG string.
 */
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
  // Compress image first
  const compressed = await compressImage(base64Image);

  // Extract pure base64 and mimeType
  const match = compressed.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) throw new Error("Formato immagine non valido");

  const mimeType = match[1];
  const base64Data = match[2];

  console.log("[AI] Invio immagine a Gemini...", {
    mimeType,
    sizeKB: Math.round(base64Data.length * 0.75 / 1024),
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: `Guarda questa foto di una confezione di medicinale e rispondi con un JSON.

Identifica:
1. Il nome commerciale del medicinale (scritto sulla confezione)
2. Il principio attivo
3. Il formato (${FORMATS.join(", ")})
4. Per quali sintomi è indicato, scegliendo tra questi ID: ${SYMPTOM_CATEGORIES.map((s) => `${s.id} (${s.label})`).join(", ")}
5. Note utili: dosaggio, avvertenze, come assumerlo

Rispondi SOLO con questo JSON:
{
  "nome": "...",
  "principioAttivo": "...",
  "formato": "...",
  "sintomiIds": ["..."],
  "note": "..."
}`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[AI] Errore API:", response.status, errorBody);
    throw new Error(`Errore API Gemini: ${response.status}`);
  }

  const data = await response.json();
  console.log("[AI] Risposta ricevuta:", JSON.stringify(data).substring(0, 500));

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Nessuna risposta dall'AI");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[AI] Impossibile estrarre JSON da:", text);
    throw new Error("Risposta non valida dall'AI");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  console.log("[AI] Dati estratti:", parsed);

  // Validate formato
  const formato = FORMATS.includes(parsed.formato) ? parsed.formato : "Altro";

  // Validate sintomi IDs
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
