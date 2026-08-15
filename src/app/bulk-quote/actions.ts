"use server";

import { createClient } from "@/lib/supabase/server";
import { isCustomerBlocked } from "@/lib/checkBlocked";
import { notifyAdmin } from "@/lib/notify";

type BulkItem = {
  productId: string;
  name: string;
  quantity: number;
};

export async function submitBulkQuoteRequest(input: {
  items: BulkItem[];
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
    return { success: false, error: "Select at least one product and a quantity." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      order_type: "bulk_quote_request",
      status: "pending",
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
    product_id: item.productId,
    material_name: item.name,
    quantity: item.quantity,
    unit: "units",
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  const itemsList = input.items.map((i) => `${i.name} × ${i.quantity}`).join("<br/>");
  await notifyAdmin(
    "New bulk pricing request — Primemet",
    `<p><strong>New bulk quote request</strong></p>
     <p>${itemsList}</p>
     ${input.isSubscription ? `<p>Subscription: ${input.subscriptionFrequency}</p>` : ""}
     ${input.notes ? `<p>Notes: ${input.notes}</p>` : ""}`
  );

  return { success: true, orderId: order.id as string };
}
