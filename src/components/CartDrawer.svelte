<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import {
    cart,
    isCartDrawerOpen,
    removeCartItem,
    updateCartItemQty,
    clearCart,
    cartTotal,
    cartTotalQuantity,
  } from "../stores/cart";
  import {
    collectionDetails,
    saveCollectionDetails,
    collectionTimeLabels,
  } from "../stores/collectionDetails";
  import type { CollectionTime } from "../stores/collectionDetails";
  import { clickOutside } from "../utils/click-outside";

  let drawerEl: HTMLDivElement | undefined = $state();
  let checking = $state(false);
  let checkoutError = $state("");

  // Collection details form state (pre-fill from store)
  let studentName = $state($collectionDetails.studentName);
  let collectionTime: CollectionTime = $state($collectionDetails.collectionTime);

  function formatSGD(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function closeDrawer() {
    document.body.classList.remove("overflow-hidden");
    isCartDrawerOpen.set(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") closeDrawer();
  }

  $effect(() => {
    if ($isCartDrawerOpen) {
      document.body.classList.add("overflow-hidden");
      drawerEl?.focus();
    }
  });

  async function handleCheckout() {
    checkoutError = "";

    if (!studentName.trim()) {
      checkoutError = "Please enter your name.";
      return;
    }

    if ($cart.length === 0) {
      checkoutError = "Your cart is empty.";
      return;
    }

    saveCollectionDetails({ studentName: studentName.trim(), collectionTime });

    checking = true;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: $cart,
          studentName: studentName.trim(),
          collectionTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        checkoutError = data.error ?? "Checkout failed. Please try again.";
        return;
      }
      // Redirect to Stripe PayNow checkout
      window.location.href = data.url;
    } catch {
      checkoutError = "Network error. Please try again.";
    } finally {
      checking = false;
    }
  }
</script>

{#if $isCartDrawerOpen}
  <!-- Backdrop -->
  <div
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 300 }}
    style="position: fixed; inset: 0; z-index: 40; background: rgba(45,45,45,0.4); backdrop-filter: blur(2px);"
    aria-hidden="true"
  ></div>

  <!-- Drawer -->
  <div
    style="position: fixed; inset: 0; z-index: 99; overflow: hidden;"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cart-title"
  >
    <div style="position: absolute; inset: 0; overflow: hidden;">
      <div
        role="document"
        style="pointer-events: none; position: fixed; inset-y: 0; right: 0; display: flex; max-width: 100%; padding-left: 1.5rem;"
        tabindex="-1"
        use:clickOutside={() => closeDrawer()}
        bind:this={drawerEl}
        onkeydown={onKeyDown}
      >
        <div
          in:fly={{ duration: 400, x: 500, opacity: 1 }}
          out:fly={{ duration: 300, x: 500, opacity: 1 }}
          style="pointer-events: auto; width: 100vw; max-width: 30rem; background: #fdfbf7; display: flex; flex-direction: column; height: 100vh; border-left: 3px solid #2d2d2d; box-shadow: -6px 0 0 #2d2d2d;"
        >
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e5e0d8; padding: 1.25rem 1.5rem; flex-shrink: 0; background: #fff9c4;">
            <h2 id="cart-title" style="font-family: 'Kalam', cursive; font-size: 1.4rem; color: #2d2d2d;">
              Your Cart
              {#if cartTotalQuantity($cart) > 0}
                <span style="font-family: 'Patrick Hand', cursive; font-size: 0.85rem; color: #2d2d2d; opacity: 0.55; margin-left: 0.4rem;">
                  ({cartTotalQuantity($cart)} item{cartTotalQuantity($cart) !== 1 ? "s" : ""})
                </span>
              {/if}
            </h2>
            <button
              onclick={() => closeDrawer()}
              style="padding: 0.4rem; color: #2d2d2d; opacity: 0.5; background: none; border: none; cursor: pointer; transition: opacity 120ms;"
              aria-label="Close cart"
              onmouseover={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onmouseout={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
            >
              <svg style="width: 1.4rem; height: 1.4rem;" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div style="flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem;">
            {#if $cart.length === 0}
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 12rem; text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🛒</div>
                <p style="font-family: 'Kalam', cursive; font-size: 1.1rem; color: #2d2d2d; opacity: 0.5;">Your cart is empty</p>
              </div>
            {:else}
              <!-- Store name -->
              <p style="font-family: 'Kalam', cursive; font-size: 0.8rem; color: #2d2d2d; opacity: 0.5; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                {$cart[0].storeName}
              </p>

              <!-- Items list -->
              <ul style="margin-bottom: 1.25rem;">
                {#each $cart as item (item.id)}
                  <li style="padding: 0.85rem 0; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px dashed #e5e0d8;">
                    <div style="flex: 1; min-width: 0;">
                      <p style="font-family: 'Kalam', cursive; font-size: 0.95rem; color: #2d2d2d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{item.name}</p>
                      <p style="font-family: 'Patrick Hand', cursive; font-size: 0.8rem; color: #2d2d2d; opacity: 0.55;">{formatSGD(item.priceInCents)} each</p>
                    </div>

                    <!-- Qty controls -->
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <button
                        onclick={() => updateCartItemQty(item.id, item.qty - 1)}
                        style="width: 1.6rem; height: 1.6rem; border: 1.5px solid #2d2d2d; border-radius: 4px 6px 4px 6px / 6px 4px 6px 4px; display: flex; align-items: center; justify-content: center; background: white; cursor: pointer; box-shadow: 2px 2px 0 #2d2d2d;"
                        aria-label="Decrease quantity"
                      >
                        <svg style="width: 0.7rem; height: 0.7rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
                        </svg>
                      </button>
                      <span style="width: 1.5rem; text-align: center; font-family: 'Kalam', cursive; font-size: 0.9rem; color: #2d2d2d;">{item.qty}</span>
                      <button
                        onclick={() => updateCartItemQty(item.id, item.qty + 1)}
                        style="width: 1.6rem; height: 1.6rem; border: 1.5px solid #2d2d2d; border-radius: 4px 6px 4px 6px / 6px 4px 6px 4px; display: flex; align-items: center; justify-content: center; background: white; cursor: pointer; box-shadow: 2px 2px 0 #2d2d2d;"
                        aria-label="Increase quantity"
                      >
                        <svg style="width: 0.7rem; height: 0.7rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <!-- Line total -->
                    <span style="font-family: 'Kalam', cursive; font-size: 0.9rem; color: #2d2d2d; width: 3.5rem; text-align: right; flex-shrink: 0;">
                      {formatSGD(item.priceInCents * item.qty)}
                    </span>

                    <!-- Remove -->
                    <button
                      onclick={() => removeCartItem(item.id)}
                      style="color: #2d2d2d; opacity: 0.3; background: none; border: none; cursor: pointer; transition: opacity 120ms; margin-left: 0.25rem;"
                      aria-label="Remove {item.name}"
                      onmouseover={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = '1'; el.style.color = '#ff4d4d'; }}
                      onmouseout={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.3'; el.style.color = '#2d2d2d'; }}
                    >
                      <svg style="width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                {/each}
              </ul>

              <!-- Clear cart -->
              <button
                onclick={() => clearCart()}
                style="font-family: 'Patrick Hand', cursive; font-size: 0.8rem; color: #2d2d2d; opacity: 0.4; background: none; border: none; cursor: pointer; text-decoration: underline; text-decoration-style: wavy; margin-bottom: 1.25rem;"
              >
                Clear cart
              </button>

              <!-- Collection details -->
              <div style="border-top: 1px dashed #e5e0d8; padding-top: 1.25rem;">
                <h3 style="font-family: 'Kalam', cursive; font-size: 1.1rem; color: #2d2d2d; margin-bottom: 1rem;">Your details</h3>

                <label style="display: block; margin-bottom: 1rem;">
                  <span style="display: block; font-family: 'Patrick Hand', cursive; font-size: 0.9rem; color: #2d2d2d; margin-bottom: 0.35rem;">Your name</span>
                  <input
                    type="text"
                    bind:value={studentName}
                    placeholder="e.g. Bryan"
                    style="width: 100%; border: 2px solid #2d2d2d; border-radius: 8px 4px 10px 4px / 4px 10px 4px 8px; padding: 0.5rem 0.75rem; font-family: 'Patrick Hand', cursive; font-size: 0.95rem; background: white; color: #2d2d2d; outline: none; box-shadow: 2px 2px 0 #2d2d2d;"
                    autocomplete="given-name"
                  />
                </label>

                <label style="display: block; margin-bottom: 0.5rem;">
                  <span style="display: block; font-family: 'Patrick Hand', cursive; font-size: 0.9rem; color: #2d2d2d; margin-bottom: 0.35rem;">Collection time</span>
                  <select
                    bind:value={collectionTime}
                    style="width: 100%; border: 2px solid #2d2d2d; border-radius: 8px 4px 10px 4px / 4px 10px 4px 8px; padding: 0.5rem 0.75rem; font-family: 'Patrick Hand', cursive; font-size: 0.95rem; background: white; color: #2d2d2d; outline: none; box-shadow: 2px 2px 0 #2d2d2d;"
                  >
                    {#each Object.entries(collectionTimeLabels) as [key, label]}
                      <option value={key}>{label}</option>
                    {/each}
                  </select>
                </label>
              </div>
            {/if}
          </div>

          <!-- Footer -->
          {#if $cart.length > 0}
            <div style="border-top: 2px solid #e5e0d8; padding: 1.25rem 1.5rem; flex-shrink: 0; background: #fdfbf7;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-family: 'Kalam', cursive; font-size: 1.05rem; color: #2d2d2d;">Total</span>
                <span style="font-family: 'Kalam', cursive; font-size: 1.2rem; color: #2d2d2d; padding: 2px 10px; background: #fff9c4; border: 2px solid #2d2d2d; border-radius: 4px 8px 4px 8px / 8px 4px 8px 4px; box-shadow: 2px 2px 0 #2d2d2d;">{formatSGD(cartTotal($cart))}</span>
              </div>

              {#if checkoutError}
                <p style="font-family: 'Patrick Hand', cursive; font-size: 0.9rem; color: #ff4d4d; margin-bottom: 0.75rem;">{checkoutError}</p>
              {/if}

              <button
                onclick={handleCheckout}
                disabled={checking}
                style="width: 100%; border: 2px solid #2d2d2d; border-radius: 50px 40px 50px 40px / 40px 50px 40px 50px; padding: 0.75rem 1.5rem; font-family: 'Kalam', cursive; font-size: 1.05rem; font-weight: 700; background: #ff4d4d; color: white; box-shadow: 4px 4px 0 #2d2d2d; transition: all 120ms ease; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
                onmouseover={(e) => { const el = e.currentTarget as HTMLButtonElement; if (!el.disabled) { el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '5px 5px 0 #2d2d2d'; } }}
                onmouseout={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '4px 4px 0 #2d2d2d'; }}
              >
                {#if checking}
                  <svg style="animation: spin 1s linear infinite; width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24">
                    <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting…
                {:else}
                  Pay with PayNow
                  <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                {/if}
              </button>

              <p style="text-align: center; font-family: 'Patrick Hand', cursive; font-size: 0.75rem; color: #2d2d2d; opacity: 0.4; margin-top: 0.5rem;">
                Secure payment via Stripe · SGD only
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
