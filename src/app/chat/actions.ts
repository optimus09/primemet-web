"use server";

import { askGemini } from "@/lib/gemini";
import { getSiteSettings } from "@/lib/settings";

export type ChatMessage = { role: "user" | "assistant"; text: string };

const SYSTEM_CONTEXT = `You are a helpful assistant embedded on the Primemet website, an industrial B2B company in Vadodara, Gujarat, India. Primemet does two things:

1. Buys industrial scrap metal from manufacturing plants (MS Turnings, HMS 1&2, Aluminium, Copper, SS 304/316, Brass & Alloys) — customers submit a pickup request via the "Sell Your Scrap" page, choosing materials and estimated weight, plant location, and preferred date. There's also a subscription option for recurring pickups.
2. Supplies spare parts and consumables to plants — welding rods & electrodes, industrial hardware & fasteners, and machine spares — via a product catalog customers can browse and order from. There's also a "Bulk Pricing" page for volume orders, and an "AI Quote" page where customers can upload a drawing/BOM/photo and get parts automatically matched and quoted.

Customers need an account (free signup) to place any order or request. Prices may or may not be shown depending on the admin's settings — if asked about specific pricing, tell them to browse the catalog or submit a request and the team will follow up with pricing.

Contact: info@primemet.in. GSTIN: 24ABJFP4844R1ZH.

Answer customer questions about how the site works, what Primemet does, and how to place an order or scrap request. Be concise (2-4 sentences typically). If you don't know something specific (like exact current prices or lead times), say so honestly and suggest they submit a request or contact info@primemet.in directly. Do not invent specific prices, dates, or facts not given here.`;

export async function sendChatMessage(
  history: ChatMessage[],
  message: string
): Promise<{ success: true; reply: string } | { success: false; error: string }> {
  const settings = await getSiteSettings();
  if (!settings.enable_ai_features) {
    return { success: false, error: "Chat is currently unavailable." };
  }

  const trimmedHistory = history.slice(-10);
  const conversation = trimmedHistory
    .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt = `${SYSTEM_CONTEXT}\n\nConversation so far:\n${conversation}\n\nCustomer: ${message}\n\nAssistant:`;

  try {
    const reply = await askGemini(prompt);
    return { success: true, reply: reply.trim() };
  } catch (err) {
    console.error("[chat] failed:", err);
    return { success: false, error: "Something went wrong. Please try again or email info@primemet.in." };
  }
}
