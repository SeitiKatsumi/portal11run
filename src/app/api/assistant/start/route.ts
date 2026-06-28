import { NextResponse } from "next/server";
import { createChatLead } from "@/lib/assistantStore";

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

  const message = `Olá, ${lead.name}. Envie sua pergunta sobre Onze Futuro, Circuito Futuro 11, 11 Regional, Bolsas ou App 11Run. Se a IA estiver ligada no painel, ela responde com base no conteúdo do site; se não estiver, a equipe assume por aqui.`;

  return NextResponse.json({ lead, message });
}
