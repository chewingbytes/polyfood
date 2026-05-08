<script lang="ts">
  import { onMount } from "svelte";
  import { supabaseBrowser } from "../utils/supabase-browser";
  import type { User } from "@supabase/supabase-js";

  let user: User | null = null;
  let ready = false;

  onMount(async () => {
    const { data } = await supabaseBrowser.auth.getSession();
    user = data.session?.user ?? null;
    ready = true;

    supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      user = session?.user ?? null;
    });
  });

  async function logout() {
    await supabaseBrowser.auth.signOut();
    window.location.reload();
  }

  $: displayName = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(" ")[0]
    : user?.email?.split("@")[0] ?? "";
</script>

{#if !ready}
  <!-- skeleton so layout doesn't shift -->
  <div style="width:80px; height:38px; border:4px solid #000; background:#eee;"></div>
{:else if user}
  <div style="display:flex; align-items:center; gap:0.5rem;">
    <span
      style="border:4px solid #000; background:#C4B5FD; padding:0.3rem 0.75rem; font-size:0.75rem; font-weight:900; text-transform:uppercase; letter-spacing:0.06em; box-shadow:3px 3px 0 #000;"
    >
      {displayName}
    </span>
    <button
      on:click={logout}
      style="border:4px solid #000; background:#fff; padding:0.3rem 0.75rem; font-size:0.75rem; font-family:inherit; font-weight:900; text-transform:uppercase; letter-spacing:0.06em; cursor:pointer; box-shadow:3px 3px 0 #000;"
    >
      Logout
    </button>
  </div>
{:else}
  <a
    href="/auth/login"
    style="display:inline-block; border:4px solid #000; background:#fff; padding:0.3rem 0.875rem; font-size:0.75rem; font-weight:900; text-transform:uppercase; letter-spacing:0.06em; text-decoration:none; color:#000; box-shadow:3px 3px 0 #000;"
  >
    Login
  </a>
{/if}
