import type { APIRoute } from "astro";
import { supabase } from "../../../../../utils/supabase";
import { getStoreByVendorEmail } from "../../../../../data/sanity";

const VALID_STATUSES = ["paid", "preparing", "ready", "collected"] as const;

/**
 * POST /api/vendor/orders/[id]/status
 *
 * Advances the status of a single order.
 * Validates the vendor session cookie and ensures the order belongs
 * to the authenticated vendor's store before updating.
 * Store identity comes from Sanity (no DB stores table).
 */
export const POST: APIRoute = async ({ request, params, cookies }) => {
  // 1. Auth guard
  const token = cookies.get("sb-vendor-token")?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  // 2. Resolve this vendor's store from Sanity
  const { data: store } = await getStoreByVendorEmail(user.email ?? "");
  if (!store) return new Response("Unauthorized", { status: 401 });

  // 3. Parse and validate request body
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const { status } = body;
  if (!status || !VALID_STATUSES.includes(status as any)) {
    return new Response("Invalid status value", { status: 400 });
  }

  const orderId = params.id;

  // 4. Update — scoped to this vendor's store_sanity_id to prevent cross-store tampering
  const { error } = await supabase
    .from("active_orders")
    .update({ status })
    .eq("id", orderId)
    .eq("store_sanity_id", store._id);

  if (error) {
    console.error("Order status update error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
};
