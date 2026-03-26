import type { Metadata } from "next";
import { getStripe, getStripePriceId } from "@/lib/stripe-server";
import { PricingClient } from "./pricing-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "プラン・料金",
  description: "無料プランと Notion 安全連携のプレミアムプラン（Stripe カード決済）",
  openGraph: {
    title: "プラン・料金 | Design Story Point",
    description: "プレミアムで Notion OAuth による安全な連携とカード決済。",
  },
};

export default function PricingPage() {
  const stripeReady = Boolean(getStripe() && getStripePriceId());
  return <PricingClient stripeReady={stripeReady} />;
}
