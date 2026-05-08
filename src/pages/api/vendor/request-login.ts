import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { getStoreByVendorEmail } from "../../../data/sanity";

/**
 * POST /api/vendor/request-login
 *
 * 1. Validates the email against Sanity — only registered vendor emails proceed.
 * 2. Sends a magic link via Supabase (Resend SMTP).
 * 3. Clicking the link redirects to /vendor/auth/callback where the session is
 *    exchanged for an httpOnly cookie and the vendor is sent to the dashboard.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const { email } = body;
  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ error: "Invalid email address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Gate on Sanity — only send magic links to registered vendor emails
  const { data: store } = await getStoreByVendorEmail(email);
  if (!store) {
    return new Response(
      JSON.stringify({ error: "Email is not registered as a vendor" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Derive callback URL from the incoming request origin
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/vendor/auth/callback`;

  // Use anon client so Supabase sends the email through the configured SMTP
  const supabaseAnon = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const { error } = await supabaseAnon.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true, // auto-create Supabase account on first login
    },
  });

  if (error) {
    console.error("[vendor/request-login] Supabase signInWithOtp error:", error.message, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
