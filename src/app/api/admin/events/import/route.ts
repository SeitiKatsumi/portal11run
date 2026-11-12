import { NextResponse } from "next/server";
import { createManagedEventRegistration, EventRegistrationValidationError, replaceManagedEventRegistration } from "@/lib/event-registrations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const result = createManagedEventRegistration(await request.json());
    return NextResponse.json({ ok: true, ...result }, { status: result.created ? 201 : 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof EventRegistrationValidationError ? error.message : "Não foi possível importar os participantes." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const result = replaceManagedEventRegistration(await request.json());
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof EventRegistrationValidationError ? error.message : "Não foi possível corrigir os participantes." }, { status: 400 });
  }
}
