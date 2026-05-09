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
    class="fixed inset-0 z-40 bg-slate-400/50 backdrop-blur-sm"
    aria-hidden="true"
  ></div>

  <!-- Drawer -->
  <div
    class="fixed inset-0 z-99 overflow-hidden"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cart-title"
  >
    <div class="absolute inset-0 overflow-hidden">
      <div
        role="document"
        class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-6 focus:outline-none"
        tabindex="-1"
        use:clickOutside={() => closeDrawer()}
        bind:this={drawerEl}
        onkeydown={onKeyDown}
      >
        <div
          in:fly={{ duration: 400, x: 500, opacity: 1 }}
          out:fly={{ duration: 300, x: 500, opacity: 1 }}
          class="pointer-events-auto w-screen max-w-lg bg-white flex flex-col max-h-screen"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b px-5 py-4 shadow-sm flex-shrink-0">
            <h2 id="cart-title" class="text-2xl font-bold text-zinc-800">
              Your Cart
              {#if cartTotalQuantity($cart) > 0}
                <span class="ml-2 text-sm font-medium text-zinc-500">
                  ({cartTotalQuantity($cart)} item{cartTotalQuantity($cart) !== 1 ? "s" : ""})
                </span>
              {/if}
            </h2>
            <button
              onclick={() => closeDrawer()}
              class="-m-2 p-2 text-zinc-400 hover:text-zinc-600"
              aria-label="Close cart"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            {#if $cart.length === 0}
              <div class="flex flex-col items-center justify-center h-full py-16 text-center">
                <svg class="w-16 h-16 text-zinc-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-zinc-400 font-medium">Your cart is empty</p>
              </div>
            {:else}
              <!-- Store name -->
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                {$cart[0].storeName}
              </p>

              <!-- Items list -->
              <ul class="divide-y divide-zinc-100 mb-6">
                {#each $cart as item (item.id)}
                  <li class="py-4 flex items-center gap-3">
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-zinc-800 truncate">{item.name}</p>
                      <p class="text-sm text-zinc-500">{formatSGD(item.priceInCents)} each</p>
                    </div>

                    <!-- Qty controls -->
                    <div class="flex items-center gap-2">
                      <button
                        onclick={() => updateCartItemQty(item.id, item.qty - 1)}
                        class="w-7 h-7 rounded border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
                        aria-label="Decrease quantity"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onclick={() => updateCartItemQty(item.id, item.qty + 1)}
                        class="w-7 h-7 rounded border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
                        aria-label="Increase quantity"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <!-- Line total -->
                    <span class="text-sm font-bold text-zinc-800 w-14 text-right">
                      {formatSGD(item.priceInCents * item.qty)}
                    </span>

                    <!-- Remove -->
                    <button
                      onclick={() => removeCartItem(item.id)}
                      class="text-zinc-300 hover:text-red-500 ml-1"
                      aria-label="Remove {item.name}"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                {/each}
              </ul>

              <!-- Clear cart -->
              <button
                onclick={() => clearCart()}
                class="text-xs text-zinc-400 hover:text-red-500 underline mb-6"
              >
                Clear cart
              </button>

              <!-- Collection details -->
              <div class="border-t pt-5">
                <h3 class="font-bold text-zinc-800 mb-4">Your details</h3>

                <label class="block mb-4">
                  <span class="text-sm font-semibold text-zinc-700">Your name</span>
                  <input
                    type="text"
                    bind:value={studentName}
                    placeholder="e.g. Bryan"
                    class="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                    autocomplete="given-name"
                  />
                </label>

                <label class="block mb-2">
                  <span class="text-sm font-semibold text-zinc-700">Collection time</span>
                  <select
                    bind:value={collectionTime}
                    class="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none bg-white"
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
            <div class="border-t px-5 py-4 flex-shrink-0">
              <div class="flex justify-between text-base font-bold text-zinc-800 mb-4">
                <span>Total</span>
                <span>{formatSGD(cartTotal($cart))}</span>
              </div>

              {#if checkoutError}
                <p class="text-sm text-red-600 mb-3">{checkoutError}</p>
              {/if}

              <button
                onclick={handleCheckout}
                disabled={checking}
                class="w-full rounded bg-[#635BFF] text-white font-bold py-3 px-4 flex items-center justify-center gap-2 hover:bg-[#4f47cc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {#if checking}
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting…
                {:else}
                  Pay with PayNow
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                {/if}
              </button>

              <p class="text-center text-xs text-zinc-400 mt-2">
                Secure payment via Stripe · SGD only
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

