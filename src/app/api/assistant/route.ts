import { NextResponse } from "next/server";
import {
  addChatMessage,
  classifyChatStatus,
  getChatLead,
  getChatMessages,
  updateChatLeadStatus,
  type ChatMessage
} from "@/lib/assistantStore";
import { buildLeadContext, buildRunSystemPrompt, buildWaitingMessage } from "@/lib/assistantKnowledge";

export const runtime = "nodejs";

type ResponsesContent = { text?: string };
type ResponsesOutput = { content?: ResponsesContent[] };

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1800) : "";
}

function outputText(data: unknown) {
  const payload = data as { output_text?: unknown; output?: ResponsesOutput[] };
  if (typeof payload.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => Boolean(text?.trim()))
      .join("\n")
      .trim() ?? ""
  );
}

function noStore(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = clean(searchParams.get("leadId"));
  if (!leadId) return noStore({ error: "Atendimento não encontrado." }, { status: 400 });
  const lead = getChatLead(leadId);
  if (!lead) return noStore({ error: "Atendimento não encontrado." }, { status: 404 });
  return noStore({ lead, messages: getChatMessages(leadId), aiEnabled: Boolean(lead.ai_enabled) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const leadId = clean(body && typeof body === "object" ? (body as { leadId?: unknown }).leadId : "");
  const userMessage = clean(body && typeof body === "object" ? (body as { message?: unknown }).message : "");
  if (!leadId || !userMessage) return noStore({ error: "Atendimento não encontrado ou mensagem vazia." }, { status: 400 });

  const lead = getChatLead(leadId);
  if (!lead) return noStore({ error: "Atendimento não encontrado." }, { status: 404 });

  addChatMessage({ leadId, role: "user", content: userMessage });
  const detected = lead.status !== "atendidos" && lead.status !== "improdutivos" ? classifyChatStatus(userMessage) : null;
  const updatedLead = detected ? updateChatLeadStatus(leadId, detected) ?? lead : lead;
  const messages = getChatMessages(leadId);
  const apiKey = process.env.OPENAI_API_KEY;
  let assistantMessage = "";
  let mode: "ai" | "waiting_human" | "disabled" | "error" = "waiting_human";

  if (!updatedLead.ai_enabled) {
    mode = "disabled";
  } else if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          input: [
            { role: "system", content: buildRunSystemPrompt() },
            { role: "system", content: buildLeadContext(updatedLead) },
            ...messages.slice(-14).map((message: ChatMessage) => ({ role: message.role, content: message.content }))
          ],
          temperature: 0.45,
          max_output_tokens: 650
        })
      });
      if (response.ok) {
        assistantMessage = outputText(await response.json());
        mode = assistantMessage ? "ai" : "error";
      } else {
        mode = "error";
      }
    } catch {
      mode = "error";
    }
  }

  if (!assistantMessage) assistantMessage = buildWaitingMessage();
  if (mode !== "disabled" && mode !== "waiting_human") addChatMessage({ leadId, role: "assistant", content: assistantMessage });

  return noStore({ message: assistantMessage, mode, status: updatedLead.status });
}
