import { NextResponse } from "next/server";
import { getCircuitEdition } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function GET() {
  const edition = getCircuitEdition();
  return NextResponse.json({ ok: true, version: edition.regulations_version, faq: edition.faq });
}
