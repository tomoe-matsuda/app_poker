import "server-only";

import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;
  return new Stripe(secret);
}

export function getStripePriceId(): string | null {
  const id = process.env.STRIPE_PRICE_ID?.trim();
  return id || null;
}
