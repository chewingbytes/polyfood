<script lang="ts">
  import { addCartItem, cart } from "../stores/cart";

  interface Props {
    productId: string;
    productName: string;
    priceInCents: number;
    storeId: string;
    storeName: string;
    isAvailable?: boolean;
  }

  let {
    productId,
    productName,
    priceInCents,
    storeId,
    storeName,
    isAvailable = true,
  }: Props = $props();

  let added = $state(false);

  // Warn if adding from a different store than what's already in the cart
  let differentStore = $derived(
    $cart.length > 0 && $cart[0].storeId !== storeId
  );

  function handleAdd() {
    addCartItem({ id: productId, name: productName, priceInCents, qty: 1, storeId, storeName });
    added = true;
    setTimeout(() => (added = false), 1500);
  }
</script>

{#if differentStore}
  <p style="font-size:0.8125rem; color:#b45309; margin-bottom:0.5rem;">
    ⚠️ Your cart has items from <strong>{$cart[0].storeName}</strong>. Adding this will clear your cart.
  </p>
{/if}

<button
  type="button"
  onclick={handleAdd}
  disabled={!isAvailable}
  class="button mt-4 w-full"
  style={!isAvailable ? "opacity:0.5; cursor:not-allowed;" : ""}
>
  {#if !isAvailable}
    Unavailable
  {:else if added}
    ✓ Added!
  {:else}
    Add to Cart
  {/if}
</button>
