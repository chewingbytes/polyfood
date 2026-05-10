<script lang="ts">
  import { cart, isCartDrawerOpen, cartTotalQuantity } from "../stores/cart";

  function openCart() {
    isCartDrawerOpen.set(true);
  }

  let totalQty = $derived(cartTotalQuantity($cart));
</script>

<button
  onclick={() => openCart()}
  aria-label="Open your cart"
  style="position: relative; display: flex; width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border: 2px solid #2d2d2d; border-radius: 50% 40% 50% 40% / 40% 50% 40% 50%; background: white; box-shadow: 3px 3px 0 #2d2d2d; transition: all 120ms ease; cursor: pointer; color: #2d2d2d;"
  onmouseover={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='4px 4px 0 #2d2d2d'; el.style.transform='translateY(-1px)'; }}
  onmouseout={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='3px 3px 0 #2d2d2d'; el.style.transform=''; }}
>
  <span class="sr-only">Open your cart</span>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    style="width: 1.1rem; height: 1.1rem; pointer-events: none;"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
  {#if totalQty > 0}
    <div
      style="position: absolute; top: -6px; right: -6px; background: #ff4d4d; color: white; border: 2px solid #2d2d2d; border-radius: 50%; width: 1.1rem; height: 1.1rem; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-family: 'Kalam', cursive; font-weight: 700;"
    >
      {totalQty}
    </div>
  {/if}
</button>
