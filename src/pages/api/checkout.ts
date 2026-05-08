import type { APIRoute } from "astro";
import { stripe } from "../../utils/stripe";
import type { CartItem } from "../../stores/cart";
import { collectionTimeLabels } from "../../stores/collectionDetails";
import type { CollectionTime } from "../../stores/collectionDetails";

export const POST: APIRoute = async ({ request }) => {
  let body: {
    items: CartItem[];
    studentName: string;
    collectionTime: CollectionTime;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { items, studentName, collectionTime } = body;

  if (!items?.length) {
    return new Response(JSON.stringify({ error: "Cart is empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!studentName?.trim()) {
    return new Response(JSON.stringify({ error: "Student name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const storeId = items[0]?.storeId;
  if (!storeId) {
    return new Response(JSON.stringify({ error: "Missing store ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // All items must be from the same store
  if (items.some((i) => i.storeId !== storeId)) {
    return new Response(
      JSON.stringify({ error: "Items must be from the same store" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const origin = new URL(request.url).origin;

  // Strip zero-width / invisible Unicode chars that Sanity sometimes embeds in text
  function cleanName(name: string): string {
    return name
      .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u00AD\u2060-\u2064]/g, "")
      .trim()
      .slice(0, 60); // hard cap per name
  }

  // Stripe metadata values are limited to 500 chars — keep items JSON short
  const itemsJson = JSON.stringify(
    items.map((i) => ({ name: cleanName(i.name), qty: i.qty }))
  ).slice(0, 490); // safety trim to stay under 500

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["paynow"],
    currency: "sgd",
    line_items: items.map((item) => ({
      price_data: {
        currency: "sgd",
        unit_amount: item.priceInCents,
        product_data: { name: cleanName(item.name) },
      },
      quantity: item.qty,
    })),
    metadata: {
      store_sanity_id: storeId,
      student_name: studentName.trim(),
      collection_time: collectionTimeLabels[collectionTime] ?? "As Soon As Possible",
      items_json: itemsJson,
    },
    success_url: `${origin}/checkout/success`,
    cancel_url: `${origin}/`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
