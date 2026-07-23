import { NextResponse } from "next/server";
import { getCircuitAdminDashboard, listCircuitAdminSubmissions } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status") || undefined;
  return NextResponse.json({ ok: true, metrics: getCircuitAdminDashboard(), submissions: listCircuitAdminSubmissions(status) });
}
