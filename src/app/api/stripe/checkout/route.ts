import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getStripe, getStripePriceId } from "@/lib/stripe-server";

export async function POST() {
  const stripe = getStripe();
  const priceId = getStripePriceId();
  if (!stripe || !priceId) {
    return NextResponse.json(
      { ok: false, message: "Stripe が未設定です。STRIPE_SECRET_KEY と STRIPE_PRICE_ID を設定してください。" },
      { status: 503 }
    );
  }

  const base = getSiteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ ok: false, message: "Checkout URL の生成に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true as const, url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout の作成に失敗しました。";
    return NextResponse.json({ ok: false as const, message }, { status: 500 });
  }
}
