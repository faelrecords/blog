CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'rascunho',
  is_home INTEGER NOT NULL DEFAULT 0,
  draft_json TEXT NOT NULL DEFAULT '{"version":1,"sections":[]}',
  published_json TEXT,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  author_id INTEGER NOT NULL REFERENCES users(id),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS pages_home_idx ON pages(is_home) WHERE is_home=1;
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status, updated_at);

CREATE TABLE IF NOT EXISTS page_sections (
  id TEXT NOT NULL,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  section_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (page_id,id)
);

CREATE INDEX IF NOT EXISTS page_sections_order_idx ON page_sections(page_id,position);

CREATE TABLE IF NOT EXISTS page_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  document_json TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS page_versions_page_idx ON page_versions(page_id,created_at DESC);

CREATE TABLE IF NOT EXISTS reusable_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  section_json TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS page_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  document_json TEXT NOT NULL,
  system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
