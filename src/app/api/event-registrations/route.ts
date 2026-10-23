import { NextResponse } from "next/server";
import { createEventRegistration, EventRegistrationValidationError } from "@/lib/event-registrations";
import { assertRateLimit } from "@/lib/request-guard";

export const runtime = "nodejs";
const maxBodyBytes = 256 * 1024;

class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function readPayload(request: Request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) throw new RequestError("Envie a inscrição em JSON.", 415);
  if (Number(request.headers.get("content-length")) > maxBodyBytes) throw new RequestError("A lista de participantes excede o tamanho permitido.", 413);
  if (!request.body) throw new RequestError("Cadastro inválido.", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new RequestError("A lista de participantes excede o tamanho permitido.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new RequestError("Cadastro inválido. Revise o formulário e tente novamente.", 400);
  }
}

export async function POST(request: Request) {
  try {
    try { assertRateLimit(request, "event-registrations", 8, 15 * 60_000); }
    catch { throw new RequestError("Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429); }
    const result = createEventRegistration(await readPayload(request));
    return NextResponse.json({ ok: true, ...result, message: "Inscrição recebida com sucesso. A participação é gratuita." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RequestError || error instanceof EventRegistrationValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error instanceof RequestError ? error.status : 400, headers: { "Cache-Control": "no-store" } });
    }
    console.error("[event-registrations] Não foi possível salvar a inscrição.", error);
    return NextResponse.json({ ok: false, error: "Não foi possível salvar a inscrição. Tente novamente em instantes." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
