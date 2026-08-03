import { NextResponse } from "next/server";
import { getMemberChallengesDashboard, markChallengeNotificationRead } from "@/lib/member-challenges";
import { getMemberBySessionToken } from "@/lib/members";

export const runtime = "nodejs";

function account(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("member_session="))?.slice("member_session=".length);
  return getMemberBySessionToken(token);
}

function response(data: unknown, status = 200) {
  const result = NextResponse.json(data, { status });
  result.headers.set("Cache-Control", "private, no-store");
  return result;
}

export async function GET(request: Request) {
  const member = account(request);
  if (!member) return response({ ok: false, error: "Sessão expirada." }, 401);
  return response({ ok: true, dashboard: getMemberChallengesDashboard(member.id) });
}

export async function PATCH(request: Request) {
  const member = account(request);
  if (!member) return response({ ok: false, error: "Sessão expirada." }, 401);
  const body = await request.json().catch(() => ({}));
  if (typeof body.notificationId !== "string") return response({ ok: false, error: "Notificação inválida." }, 400);
  markChallengeNotificationRead(member.id, body.notificationId);
  return response({ ok: true });
}
