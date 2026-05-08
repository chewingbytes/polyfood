import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

// Anon (public) client — safe for the browser.
// Use Supabase RLS policies to restrict what authenticated users can access.
export const supabaseBrowser = createClient(url, anonKey);
