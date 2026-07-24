import { NextResponse } from "next/server";
import { resolveCheckoutSiteUrl } from "@/lib/site-url";
import { createStripeCheckout } from "@/lib/stripe";
import type { CartInput, FulfillmentMethod } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: CartInput[];
      fulfillmentMethod?: FulfillmentMethod;
      pickupCity?: string;
    };
    const siteUrl = resolveCheckoutSiteUrl({
      configuredUrl: process.env.NEXT_PUBLIC_SITE_URL,
      requestUrl: request.url
    });
    const checkout = await createStripeCheckout(body.items ?? [], siteUrl, {
      method: body.fulfillmentMethod ?? "shipping",
      pickupCity: body.pickupCity
    });
    return NextResponse.json({ ok: true, ...checkout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.";
    const unavailable = message.includes("temporariamente indisponível");
    return NextResponse.json({ ok: false, error: message }, { status: unavailable ? 503 : 400 });
  }
}
