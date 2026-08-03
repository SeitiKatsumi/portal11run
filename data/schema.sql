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
  privacy_consent_at TEXT,
  privacy_notice_version TEXT,
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
  profile_photo_url TEXT,
  medical_certificate_file_id TEXT,
  medical_certificate_name TEXT,
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
  event_type TEXT NOT NULL DEFAULT 'outro',
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

CREATE TABLE IF NOT EXISTS support_sponsorship_leads (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  supporter_type TEXT NOT NULL,
  support_types_json TEXT NOT NULL DEFAULT '[]',
  estimated_value_cents INTEGER,
  periodicity TEXT,
  project_interest TEXT,
  message TEXT,
  best_contact_time TEXT,
  origin TEXT NOT NULL DEFAULT 'Site 11RUN',
  priority TEXT NOT NULL DEFAULT 'Normal',
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'Novo contato',
  admin_notes TEXT,
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS support_donations (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL UNIQUE,
  donor_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  project TEXT NOT NULL,
  message TEXT,
  anonymous INTEGER NOT NULL DEFAULT 0,
  transfer_date TEXT,
  account_holder TEXT,
  transaction_id TEXT,
  pix_payload TEXT NOT NULL,
  receipt_file_id TEXT,
  status TEXT NOT NULL DEFAULT 'PIX gerado',
  admin_notes TEXT,
  owner TEXT,
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS support_volunteers (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  profession TEXT NOT NULL,
  other_profession TEXT,
  company TEXT,
  professional_registration TEXT,
  portfolio_url TEXT,
  presentation TEXT,
  contribution_types_json TEXT NOT NULL DEFAULT '[]',
  available_days TEXT,
  periods_json TEXT NOT NULL DEFAULT '[]',
  frequency TEXT,
  work_mode TEXT,
  travel_distance TEXT,
  events_travel INTEGER NOT NULL DEFAULT 0,
  child_experience TEXT,
  sport_experience TEXT,
  social_experience TEXT,
  motivation TEXT NOT NULL,
  contribution_description TEXT NOT NULL,
  attachment_file_id TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'Novo cadastro',
  admin_notes TEXT,
  consent_at TEXT NOT NULL,
  truth_accepted_at TEXT NOT NULL,
  contact_authorized_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS support_private_files (
  id TEXT PRIMARY KEY,
  storage_name TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_history (
  id TEXT PRIMARY KEY,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  from_value TEXT,
  to_value TEXT,
  note TEXT,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_notifications (
  id TEXT PRIMARY KEY,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  provider_message_id TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS support_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT 'system',
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

CREATE TABLE IF NOT EXISTS store_product_variants (
  product_id TEXT NOT NULL,
  variant_code TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (product_id, variant_code),
  FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS store_variant_inventory (
  product_id TEXT NOT NULL,
  variant_code TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, variant_code, size),
  FOREIGN KEY (product_id, variant_code)
    REFERENCES store_product_variants(product_id, variant_code)
    ON DELETE CASCADE
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
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  pix_reference TEXT,
  pix_payload TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  variant_code TEXT NOT NULL DEFAULT 'casual',
  variant_label TEXT NOT NULL DEFAULT 'Casual',
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

CREATE TABLE IF NOT EXISTS virtual_circuit_official_results (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL,
  public_name TEXT NOT NULL,
  category_age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('FEMALE', 'MALE')),
  activity_date TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  competition_name TEXT NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'OFFICIAL_COMPETITION',
  validation_badge TEXT NOT NULL DEFAULT 'Oficial',
  status TEXT NOT NULL DEFAULT 'APPROVED',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (edition_id) REFERENCES virtual_circuit_editions(id)
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

CREATE TABLE IF NOT EXISTS virtual_circuit_medical_clearances (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  guardian_id TEXT NOT NULL,
  submission_id TEXT NOT NULL UNIQUE,
  clearance_method TEXT NOT NULL CHECK (clearance_method IN ('MEDICAL_CERTIFICATE', 'GUARDIAN_COMMITMENT')),
  certificate_file_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'PENDING_CERTIFICATE', 'VERIFIED', 'REJECTED')),
  guardian_cpf_confirmation_hash TEXT NOT NULL,
  declaration_text TEXT NOT NULL,
  document_version TEXT NOT NULL,
  promised_due_date TEXT,
  health_data_consent_at TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (edition_id) REFERENCES virtual_circuit_editions(id),
  FOREIGN KEY (athlete_id) REFERENCES virtual_circuit_athletes(id),
  FOREIGN KEY (guardian_id) REFERENCES virtual_circuit_guardians(id),
  FOREIGN KEY (submission_id) REFERENCES virtual_circuit_submissions(id),
  FOREIGN KEY (certificate_file_id) REFERENCES virtual_circuit_private_files(id)
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
CREATE INDEX IF NOT EXISTS idx_vc_official_results_ranking
  ON virtual_circuit_official_results (edition_id, status, category_age, gender, time_ms);
CREATE INDEX IF NOT EXISTS idx_vc_athletes_category
  ON virtual_circuit_athletes (category_age, gender, state);
CREATE INDEX IF NOT EXISTS idx_vc_audit_entity
  ON virtual_circuit_audit_logs (entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vc_medical_status
  ON virtual_circuit_medical_clearances (edition_id, status, promised_due_date);

CREATE TABLE IF NOT EXISTS japan_ranking_seasons (
  year INTEGER PRIMARY KEY,
  base_url TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  current INTEGER NOT NULL DEFAULT 0,
  refresh_hour INTEGER NOT NULL DEFAULT 5,
  refresh_interval_hours INTEGER NOT NULL DEFAULT 24,
  last_automatic_check_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS japan_ranking_event_configs (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  event_meters INTEGER NOT NULL CHECK (event_meters IN (800, 1500, 3000, 5000)),
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  event_id INTEGER,
  type_id INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  source_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (season, event_meters, gender),
  FOREIGN KEY (season) REFERENCES japan_ranking_seasons(year)
);

CREATE TABLE IF NOT EXISTS japan_ranking_imports (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  event_meters INTEGER NOT NULL,
  gender TEXT NOT NULL,
  school_year INTEGER NOT NULL,
  reference_age INTEGER NOT NULL,
  source_url TEXT NOT NULL,
  source_updated_at TEXT,
  status TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  diagnostic TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS japan_ranking_results (
  id TEXT PRIMARY KEY,
  import_batch_id TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  season INTEGER NOT NULL,
  source_url TEXT NOT NULL,
  source_updated_at TEXT,
  gender TEXT NOT NULL,
  event_meters INTEGER NOT NULL,
  school_year INTEGER NOT NULL,
  reference_age INTEGER NOT NULL,
  position INTEGER NOT NULL,
  points REAL,
  performance TEXT NOT NULL,
  performance_milliseconds INTEGER,
  athlete_name_japanese TEXT NOT NULL,
  athlete_name_kana TEXT,
  athlete_name_romaji TEXT,
  athlete_romaji_confidence REAL,
  athlete_display_override TEXT,
  prefecture_japanese TEXT,
  prefecture_portuguese TEXT,
  team_japanese TEXT,
  team_kana TEXT,
  team_romaji TEXT,
  team_display_override TEXT,
  performance_date_original TEXT,
  performance_date TEXT,
  proof_image_url TEXT,
  proof_pdf_url TEXT,
  blocked INTEGER NOT NULL DEFAULT 0,
  collected_at TEXT NOT NULL,
  UNIQUE (import_batch_id, dedupe_key),
  FOREIGN KEY (import_batch_id) REFERENCES japan_ranking_imports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS japan_ranking_jobs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  season INTEGER NOT NULL,
  event_meters INTEGER,
  gender TEXT,
  reference_age INTEGER,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  requested_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS japan_ranking_corrections (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('athlete', 'team')),
  original_text TEXT NOT NULL,
  display_text TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (entity_type, original_text)
);

CREATE INDEX IF NOT EXISTS idx_japan_rankings_public
  ON japan_ranking_results (season, gender, reference_age, event_meters, position);
CREATE INDEX IF NOT EXISTS idx_japan_rankings_batch
  ON japan_ranking_results (import_batch_id);
CREATE INDEX IF NOT EXISTS idx_japan_imports_lookup
  ON japan_ranking_imports (season, gender, reference_age, event_meters, published, created_at);
CREATE INDEX IF NOT EXISTS idx_japan_jobs_created
  ON japan_ranking_jobs (created_at);

CREATE TABLE IF NOT EXISTS japan_ranking_ai_readings (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('athlete', 'team')),
  original_text TEXT NOT NULL,
  probable_romaji TEXT,
  confidence REAL,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (entity_type, original_text)
);

CREATE INDEX IF NOT EXISTS idx_japan_ai_readings_status
  ON japan_ranking_ai_readings (status, updated_at);

CREATE TABLE IF NOT EXISTS international_ranking_imports (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL CHECK (country IN ('NO', 'US')),
  source_key TEXT NOT NULL,
  season INTEGER NOT NULL,
  event_meters INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  age_key TEXT NOT NULL,
  age_label TEXT NOT NULL,
  round_label TEXT,
  source_url TEXT NOT NULL,
  source_updated_at TEXT,
  status TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  diagnostic TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS international_ranking_results (
  id TEXT PRIMARY KEY,
  import_batch_id TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('NO', 'US')),
  source_key TEXT NOT NULL,
  season INTEGER NOT NULL,
  source_url TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  event_meters INTEGER NOT NULL,
  age_key TEXT NOT NULL,
  age_label TEXT NOT NULL,
  athlete_age INTEGER,
  position INTEGER NOT NULL,
  performance TEXT NOT NULL,
  performance_milliseconds INTEGER,
  athlete_name TEXT NOT NULL,
  team_name TEXT,
  region_name TEXT,
  birth_date TEXT,
  birth_date_original TEXT,
  meet_name TEXT,
  meet_location TEXT,
  performance_date TEXT,
  performance_date_original TEXT,
  round_label TEXT,
  source_status TEXT,
  collected_at TEXT NOT NULL,
  UNIQUE (import_batch_id, dedupe_key),
  FOREIGN KEY (import_batch_id) REFERENCES international_ranking_imports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS international_ranking_jobs (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL CHECK (country IN ('NO', 'US')),
  source_key TEXT NOT NULL,
  season INTEGER NOT NULL,
  event_meters INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  age_key TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  requested_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_international_rankings_public
  ON international_ranking_results (country, season, gender, age_key, event_meters, position);
CREATE INDEX IF NOT EXISTS idx_international_rankings_batch
  ON international_ranking_results (import_batch_id);
CREATE INDEX IF NOT EXISTS idx_international_imports_lookup
  ON international_ranking_imports (country, source_key, season, gender, age_key, event_meters, published, created_at);
CREATE INDEX IF NOT EXISTS idx_international_jobs_created
  ON international_ranking_jobs (created_at);

CREATE TABLE IF NOT EXISTS brazil_ranking_snapshots (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  age_key TEXT NOT NULL CHECK (age_key IN ('sub16', 'sub18')),
  event_meters INTEGER NOT NULL CHECK (event_meters IN (800, 1500, 2000, 3000, 5000)),
  source_url TEXT NOT NULL,
  source_updated_at TEXT,
  status TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  rows_json TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1,
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brazil_rankings_lookup
  ON brazil_ranking_snapshots (season, gender, age_key, event_meters, published, created_at);

CREATE TABLE IF NOT EXISTS world_athletics_ranking_snapshots (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('KE', 'UG', 'WORLD')),
  season INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  age_key TEXT NOT NULL CHECK (age_key IN ('u18', 'u20', 'senior')),
  event_meters INTEGER NOT NULL CHECK (event_meters IN (800, 1500, 3000, 5000, 10000)),
  source_url TEXT NOT NULL,
  source_updated_at TEXT,
  status TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  rows_json TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1,
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_world_athletics_rankings_lookup
  ON world_athletics_ranking_snapshots (scope, season, gender, age_key, event_meters, published, created_at);

CREATE TABLE IF NOT EXISTS member_challenge_definitions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  configuration_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS member_challenge_files (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  storage_name TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  purpose TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_tag TEXT NOT NULL,
  scan_status TEXT NOT NULL DEFAULT 'BASIC_VALIDATED',
  retention_until TEXT,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_challenge_submissions (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  period_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  submitted_data_json TEXT NOT NULL DEFAULT '{}',
  file_id TEXT,
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (challenge_id, account_id, period_reference),
  FOREIGN KEY (challenge_id) REFERENCES member_challenge_definitions(id),
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES member_challenge_files(id)
);

CREATE TABLE IF NOT EXISTS member_challenge_ai_analyses (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  extracted_data_json TEXT NOT NULL DEFAULT '{}',
  normalized_data_json TEXT NOT NULL DEFAULT '{}',
  confidence_score REAL NOT NULL DEFAULT 0,
  warnings_json TEXT NOT NULL DEFAULT '[]',
  suggested_score INTEGER NOT NULL DEFAULT 0,
  suggested_benefit_percent REAL NOT NULL DEFAULT 0,
  rules_version TEXT NOT NULL,
  processing_status TEXT NOT NULL,
  processed_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES member_challenge_submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_challenge_benefits (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  percentage REAL NOT NULL DEFAULT 0,
  previous_value_cents INTEGER NOT NULL DEFAULT 0,
  projected_value_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  valid_from TEXT,
  valid_until TEXT,
  approved_by TEXT,
  approved_at TEXT,
  rule_snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (source_type, source_id),
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_challenge_badges (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_json TEXT NOT NULL DEFAULT '{}',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS member_athlete_badges (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  earned_at TEXT NOT NULL,
  UNIQUE (account_id, badge_id),
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES member_challenge_badges(id)
);

CREATE TABLE IF NOT EXISTS member_challenge_ideas (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  problem TEXT NOT NULL,
  expected_improvement TEXT NOT NULL,
  image_file_id TEXT,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  score_valid INTEGER NOT NULL DEFAULT 0,
  admin_response TEXT,
  implemented_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (image_file_id) REFERENCES member_challenge_files(id)
);

CREATE TABLE IF NOT EXISTS member_challenge_score_history (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  source TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_challenge_notifications (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_challenge_audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  account_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  previous_data_json TEXT,
  new_data_json TEXT,
  justification TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES member_accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS member_challenge_settings (
  id TEXT PRIMARY KEY CHECK (id = 'default'),
  configuration_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_member_challenge_submissions_review
  ON member_challenge_submissions (status, challenge_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_member_challenge_submissions_account
  ON member_challenge_submissions (account_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_member_challenge_ideas_review
  ON member_challenge_ideas (status, created_at);
CREATE INDEX IF NOT EXISTS idx_member_challenge_benefits_account
  ON member_challenge_benefits (account_id, status, valid_until);
CREATE INDEX IF NOT EXISTS idx_member_challenge_notifications_account
  ON member_challenge_notifications (account_id, read_at, created_at);
CREATE INDEX IF NOT EXISTS idx_member_challenge_audit_entity
  ON member_challenge_audit_logs (entity_type, entity_id, created_at);
