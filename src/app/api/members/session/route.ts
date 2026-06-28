import { NextResponse } from "next/server";
import { getMemberBySessionToken, memberRoleLabels } from "@/lib/members";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("member_session="))
    ?.slice("member_session=".length);
  const account = getMemberBySessionToken(token);
  return NextResponse.json({
    ok: true,
    loggedIn: Boolean(account),
    account: account ? { id: account.id, role: account.role, roleLabel: memberRoleLabels[account.role], username: account.username } : null
  });
}
