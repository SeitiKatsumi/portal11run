import type { Metadata } from "next";
import { AdminPipeline } from "@/components/AdminPipeline";
import { ChatAdminPanel } from "@/components/ChatAdminPanel";
import { RankingAdmin } from "@/components/RankingAdmin";
import { listChatLeads } from "@/lib/assistantStore";
import { listLeads } from "@/lib/leads";
import { listRankings } from "@/lib/rankings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Cadastros 11RUN",
  description: "Painel administrativo para pipeline de cadastros do portal 11RUN."
};

export default function AdminPage() {
  const leads = listLeads();
  const rankings = listRankings();
  const chats = listChatLeads();

  return (
    <div className="admin-page">
      <AdminPipeline initialLeads={JSON.parse(JSON.stringify(leads))} />
      <RankingAdmin initialRankings={JSON.parse(JSON.stringify(rankings))} />
      <ChatAdminPanel initialChats={JSON.parse(JSON.stringify(chats))} />
    </div>
  );
}
