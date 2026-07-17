import type { Metadata } from "next";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { ChatAdminPanel } from "@/components/ChatAdminPanel";
import { collectAdminErrors, safeAdminData } from "@/lib/adminSafeData";
import { getPublicChatSettings, listChatLeads } from "@/lib/assistantStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Chat e IA 11RUN",
  description: "Atendimento, conversas e configuração da Ayla no portal 11RUN."
};

export default function AdminAtendimentoPage() {
  const chats = safeAdminData("conversas do chat", () => listChatLeads(), []);
  const chatSettings = safeAdminData("configuração da IA", () => getPublicChatSettings(), {
    openai_model: "gpt-4.1-mini",
    additional_prompt: "",
    ai_enabled: false,
    has_openai_api_key: false,
    updated_at: new Date(0).toISOString()
  });
  const errors = collectAdminErrors(chats, chatSettings);

  return (
    <>
      <AdminDataNotice errors={errors} />
      <ChatAdminPanel
        initialChats={JSON.parse(JSON.stringify(chats.data))}
        initialSettings={JSON.parse(JSON.stringify(chatSettings.data))}
      />
    </>
  );
}
