import type { APIRoute } from "astro";
import { supabase } from "../../../utils/supabase";
import { getStoreByVendorEmail } from "../../../data/sanity";

/**
 * POST /api/vendor/auth
 *
 * Called by the LoginForm after Supabase OTP verification.
 * Validates the access token, looks up the vendor's store from Sanity
 * (no DB stores table — Sanity is source of truth), and sets an httpOnly
 * session cookie if authorised.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { accessToken?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const { accessToken } = body;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Missing access token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate the JWT with the Supabase admin client
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Look up the vendor's store from Sanity using their email address
  const { data: store } = await getStoreByVendorEmail(user.email ?? "");

  if (!store) {
    return new Response(
      JSON.stringify({ error: "Email is not registered as a vendor" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Set an httpOnly cookie so the server can validate future requests
  cookies.set("sb-vendor-token", accessToken, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return new Response(
    JSON.stringify({ storeSanityId: store._id, storeName: store.name }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
