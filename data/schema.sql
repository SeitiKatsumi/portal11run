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

CREATE TABLE IF NOT EXISTS member_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS financial_records (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  project_type TEXT,
  athlete_name TEXT,
  direction TEXT NOT NULL DEFAULT 'saida',
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  sponsor_id TEXT,
  sponsor_name TEXT,
  due_date TEXT,
  paid_date TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Previsto',
  transparency_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Apoiadores',
  logo_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS creative_assets (
  id TEXT PRIMARY KEY,
  project_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS member_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'todos',
  event_date TEXT NOT NULL,
  event_time TEXT,
  location TEXT,
  description TEXT,
  participants_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS store_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_inventory (
  product_id TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, size),
  FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS store_orders (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address_json TEXT,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL DEFAULT 1990,
  total_cents INTEGER NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'pedido_feito',
  payment_status TEXT NOT NULL DEFAULT 'não pago',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  size TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE
);
