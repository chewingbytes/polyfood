<script lang="ts">
  import { onMount } from "svelte";
  import { supabaseBrowser } from "../utils/supabase-browser";
  import type { User } from "@supabase/supabase-js";

  let user: User | null = null;
  let ready = false;

  onMount(async () => {
    const { data } = await supabaseBrowser.auth.getSession();
    user = data.session?.user ?? null;

    console.log("DATA from authbutton:", data)
    ready = true;

    supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      user = session?.user ?? null;
    });
  });
</script>

{#if !ready}
  <div class="h-9 w-9 border-4 border-black bg-gray-200"></div>
{:else if user}
  <a
    href="/settings"
    aria-label="Profile settings"
    class="flex h-9 w-9 items-center justify-center border-4 border-black bg-[#C4B5FD] shadow-[3px_3px_0_#000] transition-all duration-100 hover:shadow-[5px_5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
      <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
    </svg>
  </a>
{:else}
  <a
    href="/auth/login"
    class="flex h-9 w-9 items-center justify-center border-4 border-black bg-white shadow-[3px_3px_0_#000] transition-all duration-100 hover:shadow-[5px_5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
    aria-label="Login"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
      <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
    </svg>
  </a>
{/if}
