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
  <div style="width: 2.25rem; height: 2.25rem; border: 2px solid #2d2d2d; border-radius: 50% 40% 50% 40% / 40% 50% 40% 50%; background: #e5e0d8;"></div>
{:else if user}
  <a
    href="/settings"
    aria-label="Profile settings"
    style="display: flex; width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border: 2px solid #2d2d2d; border-radius: 50% 40% 50% 40% / 40% 50% 40% 50%; background: #dbeafe; box-shadow: 3px 3px 0 #2d2d2d; transition: all 120ms ease; color: #2d2d2d; text-decoration: none;"
    onmouseover={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='4px 4px 0 #2d2d2d'; el.style.transform='translateY(-1px)'; }}
    onmouseout={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='3px 3px 0 #2d2d2d'; el.style.transform=''; }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.1rem; height: 1.1rem;">
      <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
    </svg>
  </a>
{:else}
  <a
    href="/auth/login"
    aria-label="Login"
    style="display: flex; width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border: 2px solid #2d2d2d; border-radius: 50% 40% 50% 40% / 40% 50% 40% 50%; background: white; box-shadow: 3px 3px 0 #2d2d2d; transition: all 120ms ease; color: #2d2d2d; text-decoration: none;"
    onmouseover={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='4px 4px 0 #2d2d2d'; el.style.transform='translateY(-1px)'; el.style.background='#ff4d4d'; el.style.color='white'; }}
    onmouseout={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='3px 3px 0 #2d2d2d'; el.style.transform=''; el.style.background='white'; el.style.color='#2d2d2d'; }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.1rem; height: 1.1rem;">
      <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
    </svg>
  </a>
{/if}
