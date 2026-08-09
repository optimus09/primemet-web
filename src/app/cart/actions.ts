"use server";

import { createClient } from "@/lib/supabase/server";
import { isCustomerBlocked } from "@/lib/checkBlocked";

type CheckoutItem = {
  productId: string;
  name: string;
  unitPrice: number;
  unit: string;
  quantity: number;
};

export async function checkout(items: CheckoutItem[], notes: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to place an order." };
  }

  if (await isCustomerBlocked(supabase, user.id)) {
    return { success: false, error: "Your account is currently unable to place orders. Please contact us directly." };
  }

  if (!items.length) {
    return { success: false, error: "Your cart is empty." };
  }

  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      order_type: "spare_parts_order",
      status: "pending",
      total_amount: totalAmount,
      notes,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Could not create order." };
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit: item.unit,
    price: item.unitPrice,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  return { success: true, orderId: order.id as string };
}
