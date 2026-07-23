import { NextResponse } from "next/server";
import { constructStripeEvent, processStripeEvent } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ ok: false, error: "Assinatura ausente." }, { status: 400 });

  try {
    const payload = await request.text();
    const event = constructStripeEvent(payload, signature);
    processStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Webhook inválido." },
      { status: 400 }
    );
  }
}
