import { NextResponse } from "next/server";
import { getPublicChatSettings, updateChatSettings } from "@/lib/assistantStore";

export const runtime = "nodejs";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  return NextResponse.json({ settings: getPublicChatSettings() });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Payload inválido." }, { status: 400 });

  const payload = body as {
    openai_api_key?: unknown;
    clear_openai_api_key?: unknown;
    openai_model?: unknown;
    additional_prompt?: unknown;
    ai_enabled?: unknown;
  };

  const settings = updateChatSettings({
    openaiApiKey: clean(payload.openai_api_key),
    clearOpenAiKey: payload.clear_openai_api_key === true,
    openaiModel: clean(payload.openai_model),
    additionalPrompt: typeof payload.additional_prompt === "string" ? payload.additional_prompt : undefined,
    aiEnabled: typeof payload.ai_enabled === "boolean" ? payload.ai_enabled : undefined
  });

  return NextResponse.json({ settings });
}
