import type { APIRoute } from "astro";
import { stripe } from "../../../utils/stripe";
import { supabase } from "../../../utils/supabase";

async function generateShortOrderId(storeSanityId: string): Promise<string> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("active_orders")
    .select("*", { count: "exact", head: true })
    .eq("store_sanity_id", storeSanityId)
    .gte("created_at", todayStart.toISOString());

  const num = (count ?? 0) + 1;
  return `#${String(num).padStart(3, "0")}`;
}

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe webhook] Signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("OK", { status: 200 });
  }

  const session = event.data.object as any;

  // Only process paid sessions
  if (session.payment_status !== "paid") {
    return new Response("OK", { status: 200 });
  }

  const meta = session.metadata ?? {};
  const storeSanityId: string = meta.store_sanity_id ?? "";
  const studentName: string = meta.student_name || "Unknown";
  const collectionTimeLabel: string = meta.collection_time || "As Soon As Possible";
  const itemsJson: string = meta.items_json ?? "[]";

  if (!storeSanityId) {
    console.error("[Stripe webhook] No store_sanity_id in session metadata");
    return new Response("OK", { status: 200 });
  }

  const timeOffsets: Record<string, number> = {
    "As Soon As Possible": 15,
    "In ~30 Minutes": 30,
    "In ~1 Hour": 60,
    "In ~2 Hours": 120,
  };
  const offsetMinutes = timeOffsets[collectionTimeLabel] ?? 15;
  const collectionTime = new Date(
    Date.now() + offsetMinutes * 60 * 1000
  ).toISOString();

  let items: Array<{ name: string; qty: number }> = [];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    console.error("[Stripe webhook] Failed to parse items_json:", itemsJson);
  }

  const shortOrderId = await generateShortOrderId(storeSanityId);

  const { error } = await supabase.from("active_orders").insert({
    store_sanity_id: storeSanityId,
    stripe_payment_intent_id: session.payment_intent ?? session.id,
    short_order_id: shortOrderId,
    student_name: studentName,
    items,
    collection_time: collectionTime,
    status: "paid",
  });

  if (error) {
    console.error("[Stripe webhook] Supabase insert error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }

  console.log(`✅ Order ${shortOrderId} (${studentName}) → store ${storeSanityId}`);
  return new Response("OK", { status: 200 });
};
