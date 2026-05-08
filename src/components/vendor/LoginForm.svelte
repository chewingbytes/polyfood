<script lang="ts">
  let step: "email" | "sent" = "email";
  let email = "";
  let loading = false;
  let error = "";
  let countdown = 0;

  async function requestLogin() {
    error = "";
    if (!email || !email.includes("@")) {
      error = "Please enter a valid email address.";
      return;
    }
    loading = true;

    const res = await fetch("/api/vendor/request-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      error = body.error ?? "Something went wrong. Please try again.";
      loading = false;
      return;
    }

    step = "sent";
    loading = false;

    countdown = 60;
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) clearInterval(interval);
    }, 1000);
  }

  function goBack() {
    step = "email";
    error = "";
  }
</script>

<div style="width:100%;">
  {#if step === "email"}
    <div style="background:#222; border:3px solid #333; border-radius:4px; padding:2rem;">
      <label
        for="email"
        style="display:block; margin-bottom:0.75rem; font-size:1.125rem; font-weight:900; color:#fff;"
      >
        📧 Your Email Address
      </label>
      <input
        id="email"
        type="email"
        bind:value={email}
        placeholder="yourname@email.com"
        style="width:100%; border:3px solid #555; background:#111; color:#fff; padding:1rem 1.25rem; font-family:inherit; font-size:1.25rem; font-weight:700; margin-bottom:1.25rem; border-radius:4px; outline:none;"
        on:focus={(e) => e.currentTarget.style.borderColor = '#FFD93D'}
        on:blur={(e) => e.currentTarget.style.borderColor = '#555'}
        on:keydown={(e) => e.key === 'Enter' && requestLogin()}
      />

      {#if error}
        <div style="border:3px solid #FF6B6B; background:#2a0000; color:#FF6B6B; padding:1rem; font-size:1rem; font-weight:700; margin-bottom:1.25rem; border-radius:4px;">
          ⚠️ {error}
        </div>
      {/if}

      <button
        on:click={requestLogin}
        disabled={loading}
        style="width:100%; border:none; background:{loading ? '#555' : '#FFD93D'}; color:#000; padding:1.25rem; font-family:inherit; font-size:1.25rem; font-weight:900; cursor:{loading ? 'not-allowed' : 'pointer'}; border-radius:4px; transition:background 0.15s;"
      >
        {loading ? "⏳ Sending…" : "Send Login Link →"}
      </button>
    </div>

  {:else}
    <!-- Sent: check inbox -->
    <div style="background:#222; border:3px solid #4ade80; border-radius:4px; padding:2rem; text-align:center;">
      <div style="font-size:4rem; margin-bottom:1rem;">📬</div>
      <h2 style="font-size:1.75rem; font-weight:900; color:#fff; margin-bottom:0.75rem;">
        Check Your Email!
      </h2>
      <p style="font-size:1.125rem; font-weight:700; color:#aaa; margin-bottom:0.5rem; line-height:1.6;">
        We sent a login link to:
      </p>
      <p style="font-size:1.25rem; font-weight:900; color:#FFD93D; margin-bottom:1.5rem; word-break:break-all;">
        {email}
      </p>
      <p style="font-size:1rem; font-weight:700; color:#888; margin-bottom:2rem; line-height:1.6;">
        Open your email and click the link.<br />It will log you in automatically.
      </p>

      <button
        on:click={requestLogin}
        disabled={countdown > 0 || loading}
        style="width:100%; border:3px solid {countdown > 0 ? '#333' : '#FFD93D'}; background:none; color:{countdown > 0 ? '#555' : '#FFD93D'}; padding:1rem; font-family:inherit; font-size:1rem; font-weight:900; cursor:{countdown > 0 ? 'not-allowed' : 'pointer'}; border-radius:4px; margin-bottom:1rem;"
      >
        {countdown > 0 ? `⏳ Resend in ${countdown}s` : "🔁 Send Again"}
      </button>

      <button
        on:click={goBack}
        style="background:none; border:none; color:#666; font-family:inherit; font-size:1rem; font-weight:700; cursor:pointer; padding:0.5rem; text-decoration:underline;"
      >
        ← Use a different email
      </button>
    </div>
  {/if}
</div>
