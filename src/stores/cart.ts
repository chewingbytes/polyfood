import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";

export const isCartDrawerOpen = atom(false);

export interface CartItem {
  id: string;           // Sanity _id of foodProduct
  name: string;
  priceInCents: number; // SGD cents, e.g. 450 = $4.50
  qty: number;
  storeId: string;      // Sanity _id of store
  storeName: string;
}

export const cart = persistentAtom<CartItem[]>("fap-cart", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/** Add or increment an item. If items from a different store exist, clears the cart first. */
export function addCartItem(item: CartItem) {
  const current = cart.get();
  const existingStore = current[0]?.storeId;

  let base = current;
  if (existingStore && existingStore !== item.storeId) {
    // Different store — start fresh
    base = [];
  }

  const idx = base.findIndex((i) => i.id === item.id);
  let next: CartItem[];
  if (idx >= 0) {
    next = base.map((i, n) =>
      n === idx ? { ...i, qty: i.qty + item.qty } : i
    );
  } else {
    next = [...base, item];
  }
  cart.set(next);
  isCartDrawerOpen.set(true);
}

export function removeCartItem(productId: string) {
  cart.set(cart.get().filter((i) => i.id !== productId));
}

export function updateCartItemQty(productId: string, qty: number) {
  if (qty <= 0) {
    removeCartItem(productId);
    return;
  }
  cart.set(cart.get().map((i) => (i.id === productId ? { ...i, qty } : i)));
}

export function clearCart() {
  cart.set([]);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceInCents * i.qty, 0);
}

export function cartTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
