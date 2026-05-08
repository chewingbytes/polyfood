import Stripe from "stripe";

export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});
