import type { APIRoute } from "astro";

/**
 * GET /auth/callback
 *
 * Supabase email confirmation links redirect here.
 * The fragment (#access_token=...&refresh_token=...) is handled client-side
 * since it's never sent to the server — we just render a page that picks it up.
 */
export const GET: APIRoute = ({ redirect }) => {
  // The token exchange is done entirely in the browser via the script below.
  // Redirect to a lightweight page that handles it.
  return redirect("/auth/confirmed");
};
