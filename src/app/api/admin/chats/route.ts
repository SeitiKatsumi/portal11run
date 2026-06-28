import { NextResponse } from "next/server";
import {
  addChatMessage,
  chatStatuses,
  getChatMessages,
  listChatLeads,
  updateChatAi,
  updateChatLeadStatus
} from "@/lib/assistantStore";

export const runtime = "nodejs";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = clean(searchParams.get("leadId"));
  if (leadId) return NextResponse.json({ messages: getChatMessages(leadId) });
  return NextResponse.json({ leads: listChatLeads() });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const id = clean(body && typeof body === "object" ? (body as { id?: unknown }).id : "");
  const status = clean(body && typeof body === "object" ? (body as { status?: unknown }).status : "");
  const aiEnabled = body && typeof body === "object" ? (body as { ai_enabled?: unknown }).ai_enabled : undefined;

  if (!id) return NextResponse.json({ error: "ID ausente." }, { status: 400 });

  let lead = null;
  if (status) {
    if (!chatStatuses.includes(status as (typeof chatStatuses)[number])) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    lead = updateChatLeadStatus(id, status as (typeof chatStatuses)[number]);
  }
  if (typeof aiEnabled === "boolean") {
    lead = updateChatAi(id, aiEnabled);
  }

  return NextResponse.json({ lead });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const leadId = clean(body && typeof body === "object" ? (body as { leadId?: unknown }).leadId : "");
  const message = clean(body && typeof body === "object" ? (body as { message?: unknown }).message : "");
  if (!leadId || !message) return NextResponse.json({ error: "Atendimento ou mensagem ausente." }, { status: 400 });
  addChatMessage({ leadId, role: "assistant", content: message, senderName: "Equipe 11RUN" });
  return NextResponse.json({ ok: true, messages: getChatMessages(leadId) });
}
