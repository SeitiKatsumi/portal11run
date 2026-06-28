CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  state TEXT,
  profile_type TEXT,
  project_type TEXT NOT NULL,
  athlete_name TEXT,
  birth_date TEXT,
  age TEXT,
  category TEXT,
  school TEXT,
  team TEXT,
  best_marks TEXT,
  competitions TEXT,
  social_link TEXT,
  language_english TEXT,
  language_japanese TEXT,
  country_interest TEXT,
  message TEXT,
  accepted_contact INTEGER NOT NULL DEFAULT 0,
  accepted_terms INTEGER NOT NULL DEFAULT 0,
  term_acceptor_name TEXT,
  term_acceptor_cpf TEXT,
  photos_json TEXT,
  pipeline_status TEXT NOT NULL DEFAULT 'Cadastro recebido',
  receipts_json TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS rankings (
  id TEXT PRIMARY KEY,
  age_group TEXT NOT NULL,
  event TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rankings_event_age ON rankings(event, age_group);

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
  ai_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
