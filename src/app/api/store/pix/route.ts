import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { generatePixPayload } from "@/lib/pix";
import { assertRateLimit } from "@/lib/request-guard";
import { attachPixPayment, createOrder, type CartInput, type FulfillmentMethod } from "@/lib/store";
import { getSupportHubSettings } from "@/lib/support-hub";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "store-pix", 12, 15 * 60_000);
    const body = (await request.json()) as {
      items?: CartInput[];
      fulfillmentMethod?: FulfillmentMethod;
      pickupCity?: string;
    };
    const order = createOrder(
      body.items ?? [],
      {
        method: body.fulfillmentMethod ?? "shipping",
        pickupCity: body.pickupCity
      },
      "pix"
    );
    const settings = getSupportHubSettings();
    const reference = `PED${order.id.replace(/-/g, "").slice(0, 18).toUpperCase()}`;
    const pixPayload = generatePixPayload({
      key: settings.pixKey,
      amountCents: order.total_cents,
      merchantName: settings.pixMerchantName,
      merchantCity: settings.pixMerchantCity,
      reference
    });
    attachPixPayment(order.id, reference, pixPayload);
    const qrCode = await QRCode.toDataURL(pixPayload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 560,
      color: { dark: "#1e1d1a", light: "#fffaf2" }
    });
    return NextResponse.json(
      {
        ok: true,
        orderId: order.id,
        reference,
        amountCents: order.total_cents,
        pixPayload,
        qrCode
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível gerar o Pix." },
      { status: 400 }
    );
  }
}
