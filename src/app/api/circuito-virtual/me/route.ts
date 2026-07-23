import { NextResponse } from "next/server";
import { getGuardianDashboard } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

function tokenFromCookie(request: Request) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("circuit_guardian="))
    ?.slice("circuit_guardian=".length);
}

export async function GET(request: Request) {
  const dashboard = getGuardianDashboard(tokenFromCookie(request));
  if (!dashboard) return NextResponse.json({ ok: false, error: "Acesso expirado." }, { status: 401 });
  return NextResponse.json({ ok: true, dashboard });
}
