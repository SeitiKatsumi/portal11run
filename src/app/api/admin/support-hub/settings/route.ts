import { NextResponse } from "next/server";
import { getSupportHubSettings, updateSupportHubSettings } from "@/lib/support-hub";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, settings: getSupportHubSettings() });
}

export async function PATCH(request: Request) {
  try {
    const settings = updateSupportHubSettings(
      await request.json(),
      `admin:${process.env.ADMIN_USER || "admin"}`
    );
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível salvar." },
      { status: 400 }
    );
  }
}
