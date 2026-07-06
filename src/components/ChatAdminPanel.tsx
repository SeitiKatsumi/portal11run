"use client";

import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import type { ChatLeadWithStats, ChatMessage, ChatStatus, PublicChatSettings } from "@/lib/assistantStore";

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
  solicitou_regional: "Solicitou 11 Master",
  solicitou_bolsas: "Solicitou Bolsas",
  solicitou_app: "Solicitou App 11Run",
  atendidos: "Atendidos",
  improdutivos: "Improdutivos"
};

export function ChatAdminPanel({
  initialChats,
  initialSettings
}: {
  initialChats: ChatLeadWithStats[];
  initialSettings: PublicChatSettings;
}) {
  const [chats, setChats] = useState(initialChats);
  const [settings, setSettings] = useState(initialSettings);
  const [activeId, setActiveId] = useState(initialChats[0]?.id ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settingsMessage, setSettingsMessage] = useState("");
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

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/chat-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ai_enabled: form.get("ai_enabled") === "on",
        openai_model: form.get("openai_model"),
        openai_api_key: form.get("openai_api_key"),
        clear_openai_api_key: form.get("clear_openai_api_key") === "on",
        additional_prompt: form.get("additional_prompt")
      })
    });
    const result = await response.json();
    if (response.ok && result.settings) {
      setSettings(result.settings);
      setSettingsMessage("ConfiguraÃ§Ã£o salva.");
      event.currentTarget.reset();
    } else {
      setSettingsMessage(result.error ?? "NÃ£o foi possÃ­vel salvar.");
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
          <p>Configure a IA real da 11RUN, acompanhe conversas e assuma manualmente quando necessÃ¡rio.</p>
        </div>
      </div>

      <form className="chat-settings" onSubmit={saveSettings}>
        <div>
          <span className="eyebrow">openai</span>
          <h2>ConfiguraÃ§Ã£o do agente</h2>
          <p>
            A IA sÃ³ responde quando a chave estÃ¡ configurada, a IA global estÃ¡ ligada e a conversa tambÃ©m estÃ¡ com IA
            ligada.
          </p>
        </div>
        <label className="chat-toggle">
          <input name="ai_enabled" type="checkbox" defaultChecked={settings.ai_enabled} />
          IA global ligada
        </label>
        <label>
          <span>OpenAI API key</span>
          <input
            name="openai_api_key"
            type="password"
            placeholder={settings.has_openai_api_key ? "Chave configurada. Preencha para substituir." : "Cole a chave da OpenAI"}
            autoComplete="off"
          />
        </label>
        <label>
          <span>Modelo</span>
          <input name="openai_model" defaultValue={settings.openai_model} placeholder="gpt-4.1-mini" />
        </label>
        <label className="full">
          <span>Prompt adicional</span>
          <textarea
            name="additional_prompt"
            rows={5}
            defaultValue={settings.additional_prompt}
            placeholder="InstruÃ§Ãµes extras alÃ©m do conteÃºdo do site."
          />
        </label>
        <label className="chat-toggle">
          <input name="clear_openai_api_key" type="checkbox" />
          Apagar chave salva
        </label>
        <button className="button primary" type="submit">
          Salvar agente
        </button>
        {settingsMessage ? <p className="settings-message">{settingsMessage}</p> : null}
      </form>

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
                    {active.email} Â· {active.whatsapp}
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
                  IA nesta conversa
                </label>
                <button className="button ghost" type="button" onClick={() => patch(active.id, { ai_enabled: false, status: "atendidos" })}>
                  Assumir conversa
                </button>
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
