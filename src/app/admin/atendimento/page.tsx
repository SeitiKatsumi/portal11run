import type { Metadata } from "next";
import { ChatAdminPanel } from "@/components/ChatAdminPanel";
import { getPublicChatSettings, listChatLeads } from "@/lib/assistantStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Chat e IA 11RUN",
  description: "Atendimento, conversas e configuração da Ayla no portal 11RUN."
};

export default function AdminAtendimentoPage() {
  const chats = listChatLeads();
  const chatSettings = getPublicChatSettings();

  return <ChatAdminPanel initialChats={JSON.parse(JSON.stringify(chats))} initialSettings={JSON.parse(JSON.stringify(chatSettings))} />;
}
