import { NextResponse } from "next/server";
import { createCircuitRegistration } from "@/lib/virtual-circuit";
import { assertRateLimit, clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "circuit-register", 20, 10 * 60_000);
    const payload = (await request.json()) as Parameters<typeof createCircuitRegistration>[0] & { website?: string };
    if (payload.website) return NextResponse.json({ ok: true });
    payload.meta = { ip: clientIp(request), userAgent: request.headers.get("user-agent") ?? undefined };
    const result = createCircuitRegistration(payload);
    const response = NextResponse.json({
      ok: true,
      message: "Atividade recebida com sucesso. A análise foi iniciada.",
      submissionId: result.submissionId
    });
    response.cookies.set("circuit_guardian", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(result.expiresAt)
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível enviar a inscrição." },
      { status: 400 }
    );
  }
}
