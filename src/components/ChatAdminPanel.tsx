"use client";

import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import type { ChatLeadWithStats, ChatMessage, ChatStatus } from "@/lib/assistantStore";

const chatStatuses: ChatStatus[] = [
  "em_atendimento_ia",
  "solicitou_onze_futuro",
  "solicitou_circuito",
  "solicitou_regional",
  "solicitou_bolsas",
  "solicitou_app",
  "atendidos",
  "improdutivos"
];

const chatStatusLabels: Record<ChatStatus, string> = {
  em_atendimento_ia: "Em atendimento IA",
  solicitou_onze_futuro: "Solicitou Onze Futuro",
  solicitou_circuito: "Solicitou Circuito 11",
  solicitou_regional: "Solicitou 11 Regional",
  solicitou_bolsas: "Solicitou Bolsas",
  solicitou_app: "Solicitou App 11Run",
  atendidos: "Atendidos",
  improdutivos: "Improdutivos"
};

export function ChatAdminPanel({ initialChats }: { initialChats: ChatLeadWithStats[] }) {
  const [chats, setChats] = useState(initialChats);
  const [activeId, setActiveId] = useState(initialChats[0]?.id ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const active = useMemo(() => chats.find((chat) => chat.id === activeId), [activeId, chats]);

  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      const response = await fetch(`/api/admin/chats?leadId=${encodeURIComponent(activeId)}`);
      if (response.ok) setMessages((await response.json()).messages ?? []);
    };
    load();
  }, [activeId]);

  async function patch(id: string, body: Record<string, unknown>) {
    const response = await fetch("/api/admin/chats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body })
    });
    const result = await response.json();
    if (response.ok && result.lead) {
      setChats((current) => current.map((chat) => (chat.id === id ? { ...chat, ...result.lead } : chat)));
    }
  }

  async function reply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeId) return;
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    if (!message) return;
    const response = await fetch("/api/admin/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: activeId, message })
    });
    const result = await response.json();
    if (response.ok) {
      setMessages(result.messages ?? []);
      event.currentTarget.reset();
    }
  }

  return (
    <section className="admin-panel admin-subpanel">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">atendimento ia</span>
          <h1>Conversas do assistente</h1>
          <p>Leads do chat 11RUN com histórico, status e resposta manual da equipe.</p>
        </div>
      </div>

      <div className="chat-admin">
        <aside>
          {chats.length === 0 ? <p>Nenhuma conversa iniciada.</p> : null}
          {chats.map((chat) => (
            <button className={chat.id === activeId ? "active" : ""} type="button" key={chat.id} onClick={() => setActiveId(chat.id)}>
              <strong>{chat.name}</strong>
              <span>{chatStatusLabels[chat.status]}</span>
              <small>{chat.last_message ?? "Sem mensagens"}</small>
            </button>
          ))}
        </aside>

        <div className="chat-detail">
          {active ? (
            <>
              <div className="chat-detail-head">
                <div>
                  <strong>{active.name}</strong>
                  <span>
                    {active.email} · {active.whatsapp}
                  </span>
                </div>
                <label>
                  <span>Status</span>
                  <select value={active.status} onChange={(event) => patch(active.id, { status: event.target.value })}>
                    {chatStatuses.map((status) => (
                      <option key={status} value={status}>
                        {chatStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="chat-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(active.ai_enabled)}
                    onChange={(event) => patch(active.id, { ai_enabled: event.target.checked })}
                  />
                  IA ligada
                </label>
              </div>

              <div className="chat-messages">
                {messages.map((message) => (
                  <div className={message.role === "user" ? "message user" : "message assistant"} key={message.id}>
                    {message.sender_name ? <small>{message.sender_name}</small> : null}
                    {message.content}
                  </div>
                ))}
              </div>

              <form className="chat-reply" onSubmit={reply}>
                <input name="message" placeholder="Responder como equipe 11RUN" />
                <button type="submit" aria-label="Enviar resposta">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <p>Selecione uma conversa.</p>
          )}
        </div>
      </div>
    </section>
  );
}
