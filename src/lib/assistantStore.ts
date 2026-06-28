import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export const chatStatuses = [
  "em_atendimento_ia",
  "solicitou_onze_futuro",
  "solicitou_circuito",
  "solicitou_regional",
  "solicitou_bolsas",
  "solicitou_app",
  "atendidos",
  "improdutivos"
] as const;

export type ChatStatus = (typeof chatStatuses)[number];

export const chatStatusLabels: Record<ChatStatus, string> = {
  em_atendimento_ia: "Em atendimento IA",
  solicitou_onze_futuro: "Solicitou Onze Futuro",
  solicitou_circuito: "Solicitou Circuito 11",
  solicitou_regional: "Solicitou 11 Regional",
  solicitou_bolsas: "Solicitou Bolsas",
  solicitou_app: "Solicitou App 11Run",
  atendidos: "Atendidos",
  improdutivos: "Improdutivos"
};

export type ChatLead = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  status: ChatStatus;
  ai_enabled: number;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatLeadWithStats = ChatLead & {
  message_count: number;
  last_message: string | null;
  last_message_at: string | null;
};

export type ChatMessage = {
  id: string;
  lead_id: string;
  role: "user" | "assistant";
  content: string;
  sender_name: string | null;
  created_at: string;
};

export type ChatSettings = {
  id: "default";
  openai_api_key: string | null;
  openai_model: string;
  additional_prompt: string;
  ai_enabled: number;
  updated_at: string;
};

export type PublicChatSettings = {
  openai_model: string;
  additional_prompt: string;
  ai_enabled: boolean;
  has_openai_api_key: boolean;
  updated_at: string;
};

let database: DatabaseSync | undefined;

function now() {
  return new Date().toISOString();
}

function getDb() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS chat_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'em_atendimento_ia',
      ai_enabled INTEGER NOT NULL DEFAULT 1,
      summary TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      sender_name TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES chat_leads(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chat_messages_lead_created_at ON chat_messages(lead_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_chat_leads_status_updated_at ON chat_leads(status, updated_at);
    CREATE TABLE IF NOT EXISTS chat_settings (
      id TEXT PRIMARY KEY CHECK (id = 'default'),
      openai_api_key TEXT,
      openai_model TEXT NOT NULL DEFAULT 'gpt-4.1-mini',
      additional_prompt TEXT NOT NULL DEFAULT '',
      ai_enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);
  database
    .prepare(
      "INSERT OR IGNORE INTO chat_settings (id, openai_api_key, openai_model, additional_prompt, ai_enabled, updated_at) VALUES ('default', NULL, 'gpt-4.1-mini', '', 0, ?)"
    )
    .run(now());
  return database;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function isChatStatus(value: unknown): value is ChatStatus {
  return typeof value === "string" && chatStatuses.includes(value as ChatStatus);
}

export function createChatLead(input: { name: string; email: string; whatsapp: string }) {
  const id = crypto.randomUUID();
  const createdAt = now();
  getDb()
    .prepare(
      "INSERT INTO chat_leads (id, name, email, whatsapp, status, ai_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(id, input.name, input.email, input.whatsapp, "em_atendimento_ia", 1, createdAt, createdAt);
  return getChatLead(id);
}

export function getChatLead(id: string) {
  return (getDb().prepare("SELECT * FROM chat_leads WHERE id = ?").get(id) as ChatLead | undefined) ?? null;
}

export function listChatLeads() {
  return getDb()
    .prepare(
      `
      SELECT
        chat_leads.*,
        COUNT(chat_messages.id) AS message_count,
        (
          SELECT content FROM chat_messages cm
          WHERE cm.lead_id = chat_leads.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT created_at FROM chat_messages cm
          WHERE cm.lead_id = chat_leads.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) AS last_message_at
      FROM chat_leads
      LEFT JOIN chat_messages ON chat_messages.lead_id = chat_leads.id
      GROUP BY chat_leads.id
      ORDER BY chat_leads.updated_at DESC
      `
    )
    .all() as ChatLeadWithStats[];
}

export function getChatMessages(leadId: string) {
  return getDb()
    .prepare("SELECT * FROM chat_messages WHERE lead_id = ? ORDER BY datetime(created_at) ASC")
    .all(leadId) as ChatMessage[];
}

export function addChatMessage(input: { leadId: string; role: ChatMessage["role"]; content: string; senderName?: string }) {
  const createdAt = now();
  getDb()
    .prepare("INSERT INTO chat_messages (id, lead_id, role, content, sender_name, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), input.leadId, input.role, input.content, input.senderName?.trim() || null, createdAt);
  getDb().prepare("UPDATE chat_leads SET updated_at = ?, summary = ? WHERE id = ?").run(createdAt, input.content.slice(0, 500), input.leadId);
}

export function getChatSettings() {
  return getDb().prepare("SELECT * FROM chat_settings WHERE id = 'default'").get() as ChatSettings;
}

export function getPublicChatSettings(): PublicChatSettings {
  const settings = getChatSettings();
  return {
    openai_model: settings.openai_model,
    additional_prompt: settings.additional_prompt,
    ai_enabled: Boolean(settings.ai_enabled),
    has_openai_api_key: Boolean(settings.openai_api_key?.trim()),
    updated_at: settings.updated_at
  };
}

export function updateChatSettings(input: {
  openaiApiKey?: string;
  clearOpenAiKey?: boolean;
  openaiModel?: string;
  additionalPrompt?: string;
  aiEnabled?: boolean;
}) {
  const current = getChatSettings();
  const nextKey = input.clearOpenAiKey ? null : input.openaiApiKey?.trim() ? input.openaiApiKey.trim() : current.openai_api_key;
  const nextModel = input.openaiModel?.trim() || current.openai_model || "gpt-4.1-mini";
  const nextPrompt = typeof input.additionalPrompt === "string" ? input.additionalPrompt.trim().slice(0, 6000) : current.additional_prompt;
  const nextAiEnabled = typeof input.aiEnabled === "boolean" ? (input.aiEnabled ? 1 : 0) : current.ai_enabled;
  const updatedAt = now();

  getDb()
    .prepare(
      "UPDATE chat_settings SET openai_api_key = ?, openai_model = ?, additional_prompt = ?, ai_enabled = ?, updated_at = ? WHERE id = 'default'"
    )
    .run(nextKey, nextModel, nextPrompt, nextAiEnabled, updatedAt);

  return getPublicChatSettings();
}

export function updateChatLeadStatus(id: string, status: ChatStatus) {
  getDb().prepare("UPDATE chat_leads SET status = ?, updated_at = ? WHERE id = ?").run(status, now(), id);
  return getChatLead(id);
}

export function updateChatAi(id: string, enabled: boolean) {
  getDb().prepare("UPDATE chat_leads SET ai_enabled = ?, updated_at = ? WHERE id = ?").run(enabled ? 1 : 0, now(), id);
  return getChatLead(id);
}

export function classifyChatStatus(message: string): ChatStatus | null {
  const value = normalize(message);
  if (/(onze futuro|base|crianca|jovem|9|10|11|12|13)/.test(value)) return "solicitou_onze_futuro";
  if (/(circuito|inscricao|prova|ranking|800|1000|1500|2000)/.test(value)) return "solicitou_circuito";
  if (/(regional|master|itatiba|alex|orcampi)/.test(value)) return "solicitou_regional";
  if (/(bolsa|universidade|eua|japao|oportunidade)/.test(value)) return "solicitou_bolsas";
  if (/(app|plataforma|treino|dados|strava|garmin)/.test(value)) return "solicitou_app";
  return null;
}
