import { NextResponse } from "next/server";
import { assertRateLimit } from "@/lib/request-guard";
import { createSponsorshipLead } from "@/lib/support-hub";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "support-sponsorship", 5, 15 * 60_000);
    const payload = (await request.json()) as Record<string, unknown>;
    if (String(payload.website ?? "")) return NextResponse.json({ ok: true });
    const record = await createSponsorshipLead(payload);
    return NextResponse.json({ ok: true, ...record }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível registrar o interesse." },
      { status: 400 }
    );
  }
}
