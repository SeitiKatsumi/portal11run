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

CREATE TABLE IF NOT EXISTS member_accounts (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_accounts_role ON member_accounts(role);
CREATE INDEX IF NOT EXISTS idx_member_accounts_username ON member_accounts(username);

CREATE TABLE IF NOT EXISTS member_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_sessions_token_hash ON member_sessions(token_hash);

CREATE TABLE IF NOT EXISTS financial_records (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  project_type TEXT,
  athlete_name TEXT,
  direction TEXT NOT NULL DEFAULT 'saida',
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  sponsor_name TEXT,
  due_date TEXT,
  paid_date TEXT,
  status TEXT NOT NULL DEFAULT 'Previsto',
  transparency_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_financial_records_lead_id ON financial_records(lead_id);

CREATE TABLE IF NOT EXISTS creative_assets (
  id TEXT PRIMARY KEY,
  project_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creative_assets_project_type ON creative_assets(project_type);

CREATE TABLE IF NOT EXISTS member_marks (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  age_group TEXT NOT NULL,
  event TEXT NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente de validação',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_marks_account_id ON member_marks(account_id);
CREATE INDEX IF NOT EXISTS idx_member_marks_lead_id ON member_marks(lead_id);

CREATE TABLE IF NOT EXISTS support_interests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  interest_plan TEXT NOT NULL DEFAULT '',
  interest_types_json TEXT NOT NULL,
  sponsored_projects_json TEXT NOT NULL DEFAULT '[]',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Novo interesse',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_interests_status_created_at ON support_interests(status, created_at);
