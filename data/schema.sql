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
  product_type TEXT NOT NULL DEFAULT 'De passeio',
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  design_image_url TEXT,
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
  fulfillment_method TEXT NOT NULL DEFAULT 'shipping',
  pickup_city TEXT,
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

CREATE TABLE IF NOT EXISTS home_settings (
  id TEXT PRIMARY KEY,
  hero_media_type TEXT NOT NULL DEFAULT 'image',
  hero_image TEXT NOT NULL,
  hero_video TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_kicker TEXT,
  content_alignment TEXT NOT NULL DEFAULT 'center',
  overlay_strength INTEGER NOT NULL DEFAULT 46,
  header_opacity INTEGER NOT NULL DEFAULT 74,
  header_blur INTEGER NOT NULL DEFAULT 18,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS home_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Circuito Virtual 11Run ------------------------------------------------------
CREATE TABLE IF NOT EXISTS virtual_circuit_editions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  distance_meters INTEGER NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  regulations_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  hero_image TEXT,
  settings_json TEXT NOT NULL DEFAULT '{}',
  regulations_text TEXT NOT NULL DEFAULT '',
  faq_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS virtual_circuit_private_files (
  id TEXT PRIMARY KEY,
  storage_name TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created_at TEXT NOT NULL,
  delete_after TEXT
);

CREATE TABLE IF NOT EXISTS virtual_circuit_guardians (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  cpf_encrypted TEXT NOT NULL,
  cpf_hash TEXT NOT NULL UNIQUE,
  relationship TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date_encrypted TEXT NOT NULL,
  access_token_hash TEXT,
  access_token_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS virtual_circuit_athletes (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  public_name TEXT NOT NULL,
  cpf_encrypted TEXT NOT NULL,
  cpf_hash TEXT NOT NULL UNIQUE,
  birth_date_encrypted TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  category_age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('FEMALE', 'MALE')),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  document_file_id TEXT NOT NULL,
  publication_authorized INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (document_file_id) REFERENCES virtual_circuit_private_files(id)
);

CREATE TABLE IF NOT EXISTS virtual_circuit_athlete_guardians (
  athlete_id TEXT NOT NULL,
  guardian_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 1,
  authorization_status TEXT NOT NULL DEFAULT 'AUTHORIZED',
  PRIMARY KEY (athlete_id, guardian_id),
  FOREIGN KEY (athlete_id) REFERENCES virtual_circuit_athletes(id) ON DELETE CASCADE,
  FOREIGN KEY (guardian_id) REFERENCES virtual_circuit_guardians(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS virtual_circuit_coaches (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  cpf_encrypted TEXT,
  cpf_hash TEXT,
  cref TEXT,
  cref_state TEXT,
  organization TEXT,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS virtual_circuit_submissions (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  guardian_id TEXT NOT NULL,
  coach_id TEXT,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('OFFICIAL_COMPETITION', 'TRACK_400M', 'OPEN_COURSE')),
  activity_date TEXT NOT NULL,
  declared_time_ms INTEGER NOT NULL,
  verified_time_ms INTEGER,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  validation_badge TEXT,
  confidence_score REAL,
  rejection_reason TEXT,
  correction_message TEXT,
  public_notes TEXT,
  internal_notes TEXT,
  activity_data_json TEXT NOT NULL DEFAULT '{}',
  submitted_at TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (edition_id) REFERENCES virtual_circuit_editions(id),
  FOREIGN KEY (athlete_id) REFERENCES virtual_circuit_athletes(id),
  FOREIGN KEY (guardian_id) REFERENCES virtual_circuit_guardians(id),
  FOREIGN KEY (coach_id) REFERENCES virtual_circuit_coaches(id)
);

CREATE TABLE IF NOT EXISTS virtual_circuit_evidence (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  original_url TEXT,
  normalized_url TEXT,
  private_file_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  accessibility_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES virtual_circuit_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (private_file_id) REFERENCES virtual_circuit_private_files(id)
);

CREATE TABLE IF NOT EXISTS virtual_circuit_validations (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  validation_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence_score REAL,
  extracted_data_json TEXT NOT NULL DEFAULT '{}',
  warnings_json TEXT NOT NULL DEFAULT '[]',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  error_message TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES virtual_circuit_submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS virtual_circuit_consents (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  edition_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  accepted INTEGER NOT NULL,
  document_version TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (guardian_id) REFERENCES virtual_circuit_guardians(id),
  FOREIGN KEY (athlete_id) REFERENCES virtual_circuit_athletes(id),
  FOREIGN KEY (edition_id) REFERENCES virtual_circuit_editions(id)
);

CREATE TABLE IF NOT EXISTS virtual_circuit_ranking_snapshots (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL,
  period_type TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  category_age INTEGER,
  gender TEXT,
  ranking_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (edition_id) REFERENCES virtual_circuit_editions(id)
);

CREATE TABLE IF NOT EXISTS virtual_circuit_awards (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL,
  period_type TEXT NOT NULL,
  category_age INTEGER,
  gender TEXT,
  award_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  value_cents INTEGER NOT NULL DEFAULT 0,
  athlete_id TEXT,
  sponsor TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  delivery_status TEXT NOT NULL DEFAULT 'PENDING',
  expected_date TEXT,
  delivery_proof TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (edition_id) REFERENCES virtual_circuit_editions(id),
  FOREIGN KEY (athlete_id) REFERENCES virtual_circuit_athletes(id)
);

CREATE TABLE IF NOT EXISTS virtual_circuit_audit_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vc_submissions_ranking
  ON virtual_circuit_submissions (edition_id, status, activity_date, declared_time_ms);
CREATE INDEX IF NOT EXISTS idx_vc_submissions_athlete
  ON virtual_circuit_submissions (athlete_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vc_athletes_category
  ON virtual_circuit_athletes (category_age, gender, state);
CREATE INDEX IF NOT EXISTS idx_vc_audit_entity
  ON virtual_circuit_audit_logs (entity_type, entity_id, created_at);
