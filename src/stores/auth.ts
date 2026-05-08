import { atom } from "nanostores";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "../utils/supabase-browser";

/** The current Supabase session (null = not logged in / guest) */
export const session = atom<Session | null>(null);

/** The current Supabase user (null = guest) */
export const currentUser = atom<User | null>(null);

/** true while the initial auth check is in progress */
export const authLoading = atom(true);

/** Initialise and subscribe to auth state — call once on the client */
export function initAuth() {
  // Resolve current session immediately
  supabaseBrowser.auth.getSession().then(({ data }) => {
    session.set(data.session ?? null);
    currentUser.set(data.session?.user ?? null);
    authLoading.set(false);
  });

  // Keep in sync with any auth changes (login, logout, token refresh)
  supabaseBrowser.auth.onAuthStateChange((_event, s) => {
    session.set(s ?? null);
    currentUser.set(s?.user ?? null);
    authLoading.set(false);
  });
}

export async function signOut() {
  await supabaseBrowser.auth.signOut();
  session.set(null);
  currentUser.set(null);
}
