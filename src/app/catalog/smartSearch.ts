import { askGeminiJSON } from "@/lib/gemini";

type CatalogProduct = { id: string; name: string; category: string };

export async function smartSearchProductIds(
  query: string,
  products: CatalogProduct[]
): Promise<string[]> {
  const catalogText = products.map((p) => `${p.id} | ${p.name} | ${p.category}`).join("\n");

  const prompt = `A customer of an industrial hardware/spare parts supplier searched for: "${query}"

Here is the product catalog (id | name | category):
${catalogText}

Return ONLY a JSON array of product ids (strings) that are relevant matches for this search, best match first. Include only genuinely relevant items — if nothing matches well, return an empty array. Do not include any explanation, just the JSON array.`;

  try {
    const ids = await askGeminiJSON<string[]>(prompt);
    return Array.isArray(ids) ? ids : [];
  } catch (err) {
    console.error("[smart-search] failed:", err);
    return [];
  }
}
