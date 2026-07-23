import { NextResponse } from "next/server";
import { clientIp } from "@/lib/request-guard";
import { submitCircuitCorrection } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

function token(request: Request) {
  return request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("circuit_guardian="))?.slice("circuit_guardian=".length);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { message?: string };
    submitCircuitCorrection(token(request), id, String(body.message ?? ""), clientIp(request));
    return NextResponse.json({ ok: true, message: "Correção enviada para nova análise." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao enviar correção." }, { status: 400 });
  }
}
