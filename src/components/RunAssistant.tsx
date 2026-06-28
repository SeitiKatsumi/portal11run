"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

type StoredLead = { leadId: string; name: string };
type Message = { id?: string; role: "user" | "assistant"; content: string; created_at?: string };

const storageKey = "run-assistant-lead";

export function RunAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState<StoredLead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const isAdmin = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setLead(JSON.parse(stored) as StoredLead);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    if (!open || !lead) return;
    const load = async () => {
      const response = await fetch(`/api/assistant?leadId=${encodeURIComponent(lead.leadId)}`);
      if (!response.ok) return;
      const result = await response.json();
      setMessages(result.messages ?? []);
    };
    load();
    const interval = window.setInterval(load, 6000);
    return () => window.clearInterval(interval);
  }, [lead, open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  if (isAdmin) return null;

  async function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/assistant/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Não foi possível iniciar o atendimento.");
      return;
    }
    const nextLead = { leadId: result.lead.id, name: result.lead.name };
    localStorage.setItem(storageKey, JSON.stringify(nextLead));
    setLead(nextLead);
    setMessages([{ role: "assistant", content: result.message }]);
  }

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    if (!message) return;
    event.currentTarget.reset();
    setMessages((current) => [...current, { role: "user", content: message }]);
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.leadId, message })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Não foi possível enviar.");
      return;
    }
    setMessages((current) => [...current, { role: "assistant", content: result.message }]);
  }

  return (
    <div className="run-assistant" data-testid="run-assistant">
      {open ? (
        <section className="assistant-panel" aria-label="Chat de atendimento 11RUN">
          <header>
            <div>
              <Bot size={18} />
              <strong>Atendimento 11RUN</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar atendimento">
              <X size={18} />
            </button>
          </header>

          {!lead ? (
            <form className="assistant-start" onSubmit={start}>
              <p>Informe seus dados para iniciar o atendimento.</p>
              <input name="name" placeholder="Nome" required />
              <input name="email" type="email" placeholder="E-mail" required />
              <input name="whatsapp" placeholder="WhatsApp" required />
              {error ? <span>{error}</span> : null}
              <button className="button primary" type="submit" disabled={loading}>
                {loading ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
                Iniciar atendimento
              </button>
            </form>
          ) : (
            <>
              <div className="assistant-messages" ref={listRef}>
                {messages.map((message, index) => (
                  <div className={message.role === "user" ? "message user" : "message assistant"} key={`${message.role}-${index}`}>
                    {message.content}
                  </div>
                ))}
              </div>
              <form className="assistant-compose" onSubmit={send}>
                <input name="message" placeholder="Digite sua mensagem" autoComplete="off" />
                <button type="submit" aria-label="Enviar mensagem">
                  <Send size={18} />
                </button>
              </form>
              {error ? <span className="assistant-error">{error}</span> : null}
            </>
          )}
        </section>
      ) : null}

      <button className="assistant-trigger" type="button" onClick={() => setOpen(true)} aria-label="Abrir chat 11RUN">
        <MessageCircle size={22} />
        <span>Chat 11RUN</span>
      </button>
    </div>
  );
}
