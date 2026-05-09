import type { APIRoute } from "astro";
import { supabase } from "../../../utils/supabase";

export const POST: APIRoute = async ({ redirect }) => {
  await supabase.auth.signOut();
  return redirect("/auth/login", 302);
};
