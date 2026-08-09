"use server";

import { createClient } from "@/lib/supabase/server";
import { isCustomerBlocked } from "@/lib/checkBlocked";

type ScrapItem = {
  materialName: string;
  estimatedWeight: number;
};

export async function submitScrapRequest(input: {
  items: ScrapItem[];
  plantLocation: string;
  preferredDate: string;
  notes: string;
  isSubscription: boolean;
  subscriptionFrequency: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to submit a request." };
  }

  if (await isCustomerBlocked(supabase, user.id)) {
    return { success: false, error: "Your account is currently unable to submit requests. Please contact us directly." };
  }

  if (!input.items.length) {
    return { success: false, error: "Select at least one material and an estimated quantity." };
  }

  if (!input.plantLocation.trim()) {
    return { success: false, error: "Plant location is required." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      order_type: "scrap_sell_request",
      status: "pending",
      plant_location: input.plantLocation,
      preferred_date: input.preferredDate || null,
      notes: input.notes,
      is_subscription: input.isSubscription,
      subscription_frequency: input.isSubscription ? input.subscriptionFrequency : null,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Could not submit request." };
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    material_name: item.materialName,
    quantity: item.estimatedWeight,
    unit: "kg",
    estimated_weight: item.estimatedWeight,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  return { success: true, orderId: order.id as string };
}
