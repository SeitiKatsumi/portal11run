import { NextResponse } from "next/server";
import { addChatMessage, createChatLead } from "@/lib/assistantStore";

export const runtime = "nodejs";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = clean(body && typeof body === "object" ? (body as { name?: unknown }).name : "");
  const email = clean(body && typeof body === "object" ? (body as { email?: unknown }).email : "");
  const whatsapp = clean(body && typeof body === "object" ? (body as { whatsapp?: unknown }).whatsapp : "");

  if (!name || !email || !whatsapp) {
    return NextResponse.json({ error: "Informe nome, e-mail e WhatsApp para iniciar." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const lead = createChatLead({ name, email, whatsapp });
  if (!lead) return NextResponse.json({ error: "Não foi possível iniciar o atendimento." }, { status: 500 });

  const message = `Olá, ${lead.name}. Sou o assistente 11RUN. Posso ajudar com Onze Futuro, Circuito Futuro 11, 11 Regional, Bolsas ou App 11Run. Qual caminho você quer entender?`;
  addChatMessage({ leadId: lead.id, role: "assistant", content: message });

  return NextResponse.json({ lead, message });
}
