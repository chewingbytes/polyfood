import {
  ALL_POLYTECHNICS_QUERY,
  POLYTECHNIC_QUERY,
  ALL_CANTEENS_QUERY,
  CANTEEN_QUERY,
  ALL_STORES_QUERY,
  STORE_QUERY,
  ALL_FOOD_PRODUCTS_QUERY,
  FOOD_PRODUCT_QUERY,
  STORE_BY_VENDOR_EMAIL_QUERY,
} from "./groq";
import { sanityFetch } from "./sanity-fetch";
import type {
  ALL_POLYTECHNICS_QUERYResult,
  POLYTECHNIC_QUERYResult,
  ALL_CANTEENS_QUERYResult,
  CANTEEN_QUERYResult,
  ALL_STORES_QUERYResult,
  STORE_QUERYResult,
  ALL_FOOD_PRODUCTS_QUERYResult,
  FOOD_PRODUCT_QUERYResult,
} from "./types.generated";

// Food at Poly Data Fetchers

export function getAllPolytechnics() {
  return sanityFetch<ALL_POLYTECHNICS_QUERYResult>({
    query: ALL_POLYTECHNICS_QUERY,
  });
}

export function getPolytechnic(slug: string) {
  return sanityFetch<POLYTECHNIC_QUERYResult>({
    params: { slug },
    query: POLYTECHNIC_QUERY,
  });
}

export function getAllCanteens() {
  return sanityFetch<ALL_CANTEENS_QUERYResult>({
    query: ALL_CANTEENS_QUERY,
  });
}

export function getCanteen(slug: string) {
  return sanityFetch<CANTEEN_QUERYResult>({
    params: { slug },
    query: CANTEEN_QUERY,
  });
}

export function getAllStores() {
  return sanityFetch<ALL_STORES_QUERYResult>({
    query: ALL_STORES_QUERY,
  });
}

export function getStore(slug: string) {
  return sanityFetch<STORE_QUERYResult>({
    params: { slug },
    query: STORE_QUERY,
  });
}

export function getAllFoodProducts() {
  return sanityFetch<ALL_FOOD_PRODUCTS_QUERYResult>({
    query: ALL_FOOD_PRODUCTS_QUERY,
  });
}

export function getFoodProduct(slug: string) {
  return sanityFetch<FOOD_PRODUCT_QUERYResult>({
    params: { slug },
    query: FOOD_PRODUCT_QUERY,
  });
}

/**
 * Returns the Sanity store document whose vendorEmail matches the given email address.
 * Used exclusively by the vendor auth flow (server-side only).
 */
export function getStoreByVendorEmail(email: string) {
  // Type cast until typegen is re-run — returns { _id, name, slug, vendorEmail } | null
  return sanityFetch<{ _id: string; name: string; slug: string; vendorEmail: string } | null>({
    params: { email },
    query: STORE_BY_VENDOR_EMAIL_QUERY,
  });
}
