import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { assertRateLimit } from "@/lib/request-guard";
import { createDonation, saveSupportFile } from "@/lib/support-hub";

export const runtime = "nodejs";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "support-donation", 8, 15 * 60_000);
    const form = await request.formData();
    if (String(form.get("website") ?? "")) return NextResponse.json({ ok: true });
    const receipt = form.get("receipt");
    const receiptFileId = receipt instanceof File && receipt.size ? await saveSupportFile(receipt, "DONATION_RECEIPT") : undefined;
    const record = await createDonation(
      {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        document: form.get("document"),
        city: form.get("city"),
        state: form.get("state"),
        amountCents: Number(form.get("amountCents")),
        project: form.get("project"),
        message: form.get("message"),
        anonymous: parseBoolean(form.get("anonymous")),
        transferDate: form.get("transferDate"),
        accountHolder: form.get("accountHolder"),
        transactionId: form.get("transactionId"),
        consent: parseBoolean(form.get("consent"))
      },
      receiptFileId
    );
    const qrCode = await QRCode.toDataURL(record.pixPayload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 560,
      color: { dark: "#1e1d1a", light: "#fffaf2" }
    });
    return NextResponse.json({ ok: true, ...record, qrCode }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível gerar o PIX." },
      { status: 400 }
    );
  }
}
