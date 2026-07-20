CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  source_path TEXT NOT NULL DEFAULT '/',
  consent_version TEXT NOT NULL DEFAULT 'v1',
  consented_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriber_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('subscribed', 'reactivated', 'updated', 'activated', 'deactivated')),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS subscribers_status_created_idx ON subscribers(status, created_at DESC);
CREATE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers(email);
CREATE INDEX IF NOT EXISTS subscriber_events_subscriber_idx ON subscriber_events(subscriber_id, created_at DESC);

INSERT OR IGNORE INTO newsletter_settings (key, value) VALUES
  ('title', 'Conteúdos exclusivos no seu e-mail'),
  ('description', 'Receba novidades, estratégias e materiais da GTChat para transformar cada conversa.'),
  ('button_label', 'Quero receber'),
  ('consent_text', 'Aceito receber conteúdos e comunicações da GTChat por e-mail.'),
  ('consent_version', 'v1');
