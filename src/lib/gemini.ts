const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

function parseJsonLoosely<T>(raw: string): T {
  let text = raw.trim();
  // Strip markdown code fences if the model added them despite JSON mode
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  try {
    return JSON.parse(text) as T;
  } catch {
    // Fall back to extracting the first balanced [...] or {...} block
    const start = text.search(/[[{]/);
    if (start === -1) throw new Error(`Could not parse JSON from Gemini response: ${raw.slice(0, 300)}`);
    const opener = text[start];
    const closer = opener === "[" ? "]" : "}";
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === opener) depth++;
      else if (text[i] === closer) {
        depth--;
        if (depth === 0) {
          return JSON.parse(text.slice(start, i + 1)) as T;
        }
      }
    }
    throw new Error(`Could not parse JSON from Gemini response: ${raw.slice(0, 300)}`);
  }
}

async function callGemini(
  parts: Part[],
  options: { jsonMode?: boolean; maxOutputTokens?: number; disableThinking?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
        maxOutputTokens: options.maxOutputTokens ?? 4096,
        ...(options.disableThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(
      `Gemini returned no content (finishReason: ${candidate?.finishReason ?? "unknown"})`
    );
  }
  return text;
}

export async function askGemini(prompt: string): Promise<string> {
  return callGemini([{ text: prompt }]);
}

export async function askGeminiJSON<T>(prompt: string): Promise<T> {
  const text = await callGemini([{ text: prompt }], {
    jsonMode: true,
    maxOutputTokens: 8192,
    disableThinking: true,
  });
  return parseJsonLoosely<T>(text);
}

export async function askGeminiWithFile(
  prompt: string,
  fileBase64: string,
  mimeType: string
): Promise<string> {
  return callGemini([
    { text: prompt },
    { inline_data: { mime_type: mimeType, data: fileBase64 } },
  ]);
}

export async function askGeminiWithFileJSON<T>(
  prompt: string,
  fileBase64: string,
  mimeType: string
): Promise<T> {
  const text = await callGemini(
    [{ text: prompt }, { inline_data: { mime_type: mimeType, data: fileBase64 } }],
    { jsonMode: true, maxOutputTokens: 8192, disableThinking: true }
  );
  return parseJsonLoosely<T>(text);
}
