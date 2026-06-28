import { NextRequest, NextResponse } from "next/server";
import { deleteMemberSession } from "@/lib/members";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  deleteMemberSession(request.cookies.get("member_session")?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("member_session");
  return response;
}
