import { NextResponse, type NextRequest } from "next/server";
import { PREMIUM_COOKIE, baseCookieOptions } from "@/lib/premium-cookies";
import { getStripe } from "@/lib/stripe-server";

type Body = { sessionId?: string };

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "JSON が不正です。" }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ ok: false, message: "sessionId が必要です。" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, message: "Stripe が未設定です。" }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.status === "complete" &&
      (session.payment_status === "paid" || session.payment_status === "no_payment_required");

    if (!paid) {
      return NextResponse.json({ ok: false, message: "支払いが完了していません。" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true as const });
    res.cookies.set(PREMIUM_COOKIE, "1", {
      ...baseCookieOptions(),
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "検証に失敗しました。";
    return NextResponse.json({ ok: false as const, message }, { status: 400 });
  }
}
