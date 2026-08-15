"use server";

import { createClient } from "@/lib/supabase/server";
import { askGeminiWithFileJSON } from "@/lib/gemini";
import { getSiteSettings } from "@/lib/settings";

type ExtractedItem = {
  productId: string | null;
  matchedName: string | null;
  recognizedText: string;
  quantity: number;
  unit: string;
};

export async function analyzeDrawing(
  fileBase64: string,
  mimeType: string
): Promise<{ success: true; items: ExtractedItem[] } | { success: false; error: string }> {
  const settings = await getSiteSettings();
  if (!settings.enable_ai_features) {
    return { success: false, error: "AI Quote is currently turned off." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to use this feature." };
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, unit")
    .eq("is_active", true);

  if (!products || products.length === 0) {
    return { success: false, error: "No products available to match against." };
  }

  const catalogText = products
    .map((p) => `id: ${p.id} | name: ${p.name} | category: ${p.category} | unit: ${p.unit}`)
    .join("\n");

  const prompt = `You are helping an industrial hardware and spare parts supplier (welding rods, fasteners, drill bits, grinding wheels, machine spares, etc.) read a customer-uploaded document. The document could be an engineering drawing, a bill of materials, a handwritten list, a spec sheet, or a photo of parts with labels.

Extract every distinct part, material, or item mentioned along with the quantity needed. For each item, try to match it to the closest item in our product catalog below by name/category. If there is no reasonable match, set productId to null but still include the item with your best guess of what it's called.

Our product catalog:
${catalogText}

Return ONLY a JSON array (no other text) where each element has this exact shape:
{"productId": "<catalog id or null>", "matchedName": "<catalog product name or null>", "recognizedText": "<what you read from the document for this item>", "quantity": <integer, default 1 if not specified>, "unit": "<unit from catalog if matched, otherwise your best guess like 'pcs' or 'kg'>"}

If the document is unreadable or contains no identifiable parts/materials, return an empty array [].`;

  try {
    const items = await askGeminiWithFileJSON<ExtractedItem[]>(prompt, fileBase64, mimeType);
    return { success: true, items: Array.isArray(items) ? items : [] };
  } catch (err) {
    console.error("[ai-quote] analysis failed:", err);
    return { success: false, error: "Couldn't analyze the file. Try a clearer photo or a different file." };
  }
}
