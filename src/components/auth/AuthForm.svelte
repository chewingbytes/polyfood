<script lang="ts">
  import { supabaseBrowser } from "../../utils/supabase-browser";
  import { session, currentUser } from "../../stores/auth";

  /** Emitted when the user successfully signs in or up */
  export let onSuccess: (() => void) | undefined = undefined;
  /** Emitted when the user chooses to continue as a guest */
  export let onGuest: (() => void) | undefined = undefined;
  /** Show the guest option (hide on the dedicated auth pages) */
  export let showGuest = true;

  type View = "choice" | "login" | "signup" | "check-email";
  let view: View = "choice";

  let email = "";
  let password = "";
  let name = "";
  let loading = false;
  let error = "";

  async function handleLogin() {
    error = "";
    loading = true;
    const { data, error: err } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    loading = false;
    if (err) { error = err.message; return; }
    session.set(data.session);
    currentUser.set(data.user);
    onSuccess?.();
  }

  async function handleSignup() {
    error = "";
    if (!name.trim()) { error = "Please enter your name."; return; }
    loading = true;
    const { error: err } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    loading = false;
    if (err) { error = err.message; return; }
    view = "check-email";
  }

  function reset() {
    view = "choice";
    email = "";
    password = "";
    name = "";
    error = "";
  }
</script>

<div style="font-family:'Space Grotesk',sans-serif;">
  {#if view === "choice"}
    <!-- Landing: choose path -->
    <div style="display:flex; flex-direction:column; gap:0.75rem;">
      {#if showGuest}
        <button
          on:click={() => onGuest?.()}
          style="border:4px solid #FFD93D; background:#FFD93D; color:#000; padding:0.875rem; font-family:inherit; font-size:0.875rem; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; box-shadow:6px 6px 0 #000; width:100%;"
        >
          Continue as Guest →
        </button>
        <div style="display:flex; align-items:center; gap:0.75rem; color:#999; font-size:0.8rem; font-weight:700;">
          <div style="flex:1; height:2px; background:#e5e7eb;"></div>
          OR
          <div style="flex:1; height:2px; background:#e5e7eb;"></div>
        </div>
      {/if}
      <button
        on:click={() => { view = "login"; }}
        style="border:4px solid #000; background:#000; color:#fff; padding:0.875rem; font-family:inherit; font-size:0.875rem; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; box-shadow:6px 6px 0 #FFD93D; width:100%;"
      >
        Login
      </button>
      <button
        on:click={() => { view = "signup"; }}
        style="border:4px solid #000; background:#FFFDF5; color:#000; padding:0.875rem; font-family:inherit; font-size:0.875rem; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; box-shadow:6px 6px 0 #000; width:100%;"
      >
        Create Account
      </button>
    </div>

  {:else if view === "login"}
    <button on:click={reset} style="background:none; border:none; font-family:inherit; font-size:0.75rem; font-weight:700; color:#666; cursor:pointer; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1.25rem; padding:0;">
      ← Back
    </button>
    <h2 style="font-size:1.5rem; font-weight:900; text-transform:uppercase; margin-bottom:1.25rem; color:#000;">Login</h2>

    <div style="display:flex; flex-direction:column; gap:0.875rem;">
      <div>
        <label for="login-email" style="display:block; font-size:0.7rem; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#555; margin-bottom:0.375rem;">Email</label>
        <input
          id="login-email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          style="width:100%; border:4px solid #000; background:#FFFDF5; color:#000; padding:0.625rem 0.875rem; font-family:inherit; font-size:0.9375rem; font-weight:700; outline:none;"
          on:focus={(e) => e.currentTarget.style.borderColor = '#FFD93D'}
          on:blur={(e) => e.currentTarget.style.borderColor = '#000'}
        />
      </div>
      <div>
        <label for="login-password" style="display:block; font-size:0.7rem; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#555; margin-bottom:0.375rem;">Password</label>
        <input
          id="login-password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          style="width:100%; border:4px solid #000; background:#FFFDF5; color:#000; padding:0.625rem 0.875rem; font-family:inherit; font-size:0.9375rem; font-weight:700; outline:none;"
          on:focus={(e) => e.currentTarget.style.borderColor = '#FFD93D'}
          on:blur={(e) => e.currentTarget.style.borderColor = '#000'}
          on:keydown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>

      {#if error}
        <p style="border:2px solid #FF6B6B; background:#fff5f5; color:#c0392b; padding:0.5rem 0.75rem; font-size:0.8125rem; font-weight:700;">{error}</p>
      {/if}

      <button
        on:click={handleLogin}
        disabled={loading}
        style="border:4px solid #000; background:#000; color:#fff; padding:0.875rem; font-family:inherit; font-size:0.875rem; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; box-shadow:6px 6px 0 #FFD93D; opacity:{loading ? 0.6 : 1};"
      >
        {loading ? "Logging in..." : "Login →"}
      </button>

      <p style="font-size:0.8125rem; font-weight:700; color:#666; text-align:center;">
        Don't have an account?
        <button on:click={() => { view = "signup"; error = ""; }} style="background:none; border:none; font-family:inherit; font-weight:900; color:#000; text-decoration:underline; cursor:pointer; padding:0;">Sign up</button>
      </p>
    </div>

  {:else if view === "signup"}
    <button on:click={reset} style="background:none; border:none; font-family:inherit; font-size:0.75rem; font-weight:700; color:#666; cursor:pointer; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1.25rem; padding:0;">
      ← Back
    </button>
    <h2 style="font-size:1.5rem; font-weight:900; text-transform:uppercase; margin-bottom:1.25rem; color:#000;">Create Account</h2>

    <div style="display:flex; flex-direction:column; gap:0.875rem;">
      <div>
        <label for="signup-name" style="display:block; font-size:0.7rem; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#555; margin-bottom:0.375rem;">Full Name</label>
        <input
          id="signup-name"
          type="text"
          bind:value={name}
          placeholder="Alex Tan"
          style="width:100%; border:4px solid #000; background:#FFFDF5; color:#000; padding:0.625rem 0.875rem; font-family:inherit; font-size:0.9375rem; font-weight:700; outline:none;"
          on:focus={(e) => e.currentTarget.style.borderColor = '#FFD93D'}
          on:blur={(e) => e.currentTarget.style.borderColor = '#000'}
        />
      </div>
      <div>
        <label for="signup-email" style="display:block; font-size:0.7rem; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#555; margin-bottom:0.375rem;">Email</label>
        <input
          id="signup-email"
          type="email"
          bind:value={email}
          placeholder="you@mymail.edu.sg"
          style="width:100%; border:4px solid #000; background:#FFFDF5; color:#000; padding:0.625rem 0.875rem; font-family:inherit; font-size:0.9375rem; font-weight:700; outline:none;"
          on:focus={(e) => e.currentTarget.style.borderColor = '#FFD93D'}
          on:blur={(e) => e.currentTarget.style.borderColor = '#000'}
        />
      </div>
      <div>
        <label for="signup-password" style="display:block; font-size:0.7rem; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#555; margin-bottom:0.375rem;">Password</label>
        <input
          id="signup-password"
          type="password"
          bind:value={password}
          placeholder="Min 8 characters"
          style="width:100%; border:4px solid #000; background:#FFFDF5; color:#000; padding:0.625rem 0.875rem; font-family:inherit; font-size:0.9375rem; font-weight:700; outline:none;"
          on:focus={(e) => e.currentTarget.style.borderColor = '#FFD93D'}
          on:blur={(e) => e.currentTarget.style.borderColor = '#000'}
          on:keydown={(e) => e.key === 'Enter' && handleSignup()}
        />
      </div>

      {#if error}
        <p style="border:2px solid #FF6B6B; background:#fff5f5; color:#c0392b; padding:0.5rem 0.75rem; font-size:0.8125rem; font-weight:700;">{error}</p>
      {/if}

      <button
        on:click={handleSignup}
        disabled={loading}
        style="border:4px solid #000; background:#FFD93D; color:#000; padding:0.875rem; font-family:inherit; font-size:0.875rem; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; box-shadow:6px 6px 0 #000; opacity:{loading ? 0.6 : 1};"
      >
        {loading ? "Creating account..." : "Create Account →"}
      </button>

      <p style="font-size:0.8125rem; font-weight:700; color:#666; text-align:center;">
        Already have an account?
        <button on:click={() => { view = "login"; error = ""; }} style="background:none; border:none; font-family:inherit; font-weight:900; color:#000; text-decoration:underline; cursor:pointer; padding:0;">Login</button>
      </p>
    </div>

  {:else if view === "check-email"}
    <div style="text-align:center; padding:1rem 0;">
      <div style="font-size:3rem; margin-bottom:1rem;">📬</div>
      <h2 style="font-size:1.5rem; font-weight:900; text-transform:uppercase; margin-bottom:0.75rem;">Check Your Email</h2>
      <p style="font-size:0.9rem; font-weight:700; color:#555; line-height:1.6;">
        We've sent a confirmation link to<br />
        <strong style="color:#000;">{email}</strong><br />
        Click it to activate your account, then come back to log in.
      </p>
      <button
        on:click={() => { view = "login"; }}
        style="margin-top:1.5rem; border:4px solid #000; background:#000; color:#fff; padding:0.75rem 1.5rem; font-family:inherit; font-size:0.875rem; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; box-shadow:6px 6px 0 #FFD93D;"
      >
        Back to Login
      </button>
    </div>
  {/if}
</div>
