import { NextRequest, NextResponse } from "next/server";
import { FORMATS, SYMPTOM_CATEGORIES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chiave API Gemini non configurata. Aggiungi GEMINI_API_KEY nel file .env.local" },
      { status: 500 }
    );
  }

  const { mimeType, base64Data } = await request.json();

  if (!mimeType || !base64Data) {
    return NextResponse.json(
      { error: "Dati immagine mancanti" },
      { status: 400 }
    );
  }

  const prompt = `Guarda questa foto di una confezione di medicinale e rispondi con un JSON.

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
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[AI] Errore API Gemini:", response.status, errorBody);

    if (response.status === 403) {
      return NextResponse.json(
        { error: "Chiave API Gemini non valida o scaduta. Controlla GEMINI_API_KEY nel file .env.local" },
        { status: 403 }
      );
    }
    if (response.status === 429) {
      return NextResponse.json(
        { error: "Troppe richieste. Riprova tra qualche secondo." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: `Errore API Gemini: ${response.status}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
