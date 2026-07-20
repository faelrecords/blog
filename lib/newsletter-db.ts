import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  NEWSLETTER_DEFAULTS,
  normalizeNewsletterSource,
  type SubscriberCsvRow,
} from "./newsletter";

const globalNewsletterDb = globalThis as unknown as {
  gtchatNewsletterDb?: Database.Database;
};

function createNewsletterDb() {
  const databasePath = path.resolve(
    process.env.NEWSLETTER_DATABASE_PATH || "./data/newsletter.sqlite",
  );
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  const migrationDir = path.join(process.cwd(), "newsletter-drizzle");
  for (const file of fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    database.exec(fs.readFileSync(path.join(migrationDir, file), "utf8"));
  }
  return database;
}

export const newsletterDb =
  globalNewsletterDb.gtchatNewsletterDb || createNewsletterDb();
if (process.env.NODE_ENV === "development")
  globalNewsletterDb.gtchatNewsletterDb = newsletterDb;

export type SubscriberStatus = "active" | "inactive";
export type Subscriber = {
  id: number;
  name: string;
  email: string;
  status: SubscriberStatus;
  source_path: string;
  consent_version: string;
  consented_at: string;
  created_at: string;
  updated_at: string;
};

export function getNewsletterSettings() {
  const rows = newsletterDb
    .prepare("SELECT key, value FROM newsletter_settings")
    .all() as { key: string; value: string }[];
  return {
    ...NEWSLETTER_DEFAULTS,
    ...Object.fromEntries(rows.map((row) => [row.key, row.value])),
  };
}

export function saveNewsletterSettings(settings: Record<string, string>) {
  const save = newsletterDb.prepare(
    "INSERT INTO newsletter_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  );
  newsletterDb.transaction(() => {
    for (const [key, value] of Object.entries(settings)) save.run(key, value);
  })();
}

export function subscribeToNewsletter(input: {
  name: string;
  email: string;
  source: string;
}) {
  const now = new Date().toISOString();
  const settings = getNewsletterSettings();
  return newsletterDb.transaction(() => {
    const existing = newsletterDb
      .prepare("SELECT * FROM subscribers WHERE email = ? COLLATE NOCASE")
      .get(input.email) as Subscriber | undefined;
    if (!existing) {
      const result = newsletterDb
        .prepare(
          `INSERT INTO subscribers
           (name,email,status,source_path,consent_version,consented_at,created_at,updated_at)
           VALUES (?,?, 'active', ?, ?, ?, ?, ?)`,
        )
        .run(
          input.name,
          input.email,
          normalizeNewsletterSource(input.source),
          settings.consent_version,
          now,
          now,
          now,
        );
      newsletterDb
        .prepare(
          "INSERT INTO subscriber_events (subscriber_id,event,created_at) VALUES (?,?,?)",
        )
        .run(result.lastInsertRowid, "subscribed", now);
      return { id: Number(result.lastInsertRowid), created: true };
    }

    if (existing.status === "inactive") {
      newsletterDb
        .prepare(
          `UPDATE subscribers SET name=?,status='active',source_path=?,consent_version=?,consented_at=?,updated_at=? WHERE id=?`,
        )
        .run(
          input.name || existing.name,
          normalizeNewsletterSource(input.source),
          settings.consent_version,
          now,
          now,
          existing.id,
        );
      newsletterDb
        .prepare(
          "INSERT INTO subscriber_events (subscriber_id,event,created_at) VALUES (?,?,?)",
        )
        .run(existing.id, "reactivated", now);
    } else if (input.name && input.name !== existing.name) {
      newsletterDb
        .prepare("UPDATE subscribers SET name=?,updated_at=? WHERE id=?")
        .run(input.name, now, existing.id);
    }
    return { id: existing.id, created: false };
  })();
}

export function newsletterStats() {
  return newsletterDb
    .prepare(
      `SELECT
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) active,
        SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) inactive,
        SUM(CASE WHEN datetime(created_at) >= datetime('now','-30 days') THEN 1 ELSE 0 END) recent
       FROM subscribers`,
    )
    .get() as {
    active: number | null;
    inactive: number | null;
    recent: number | null;
  };
}

export function listSubscribers(options: {
  query?: string;
  status?: "all" | SubscriberStatus;
  period?: "all" | "7" | "30" | "90";
  page?: number;
  pageSize?: number;
}) {
  const where: string[] = [];
  const params: unknown[] = [];
  const query = options.query?.trim();
  if (query) {
    where.push("(name LIKE ? OR email LIKE ?)");
    params.push(`%${query}%`, `%${query}%`);
  }
  if (options.status && options.status !== "all") {
    where.push("status = ?");
    params.push(options.status);
  }
  if (options.period && options.period !== "all") {
    where.push("datetime(created_at) >= datetime('now', ?)");
    params.push(`-${options.period} days`);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (
    newsletterDb
      .prepare(`SELECT COUNT(*) total FROM subscribers ${clause}`)
      .get(...params) as { total: number }
  ).total;
  const pageSize = Math.min(100, Math.max(10, options.pageSize || 20));
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pages, Math.max(1, options.page || 1));
  const items = newsletterDb
    .prepare(
      `SELECT * FROM subscribers ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, (page - 1) * pageSize) as Subscriber[];
  return { items, total, page, pages, pageSize };
}

export function activeSubscribersForExport() {
  return newsletterDb
    .prepare(
      `SELECT name,email,status,source_path,consented_at
       FROM subscribers WHERE status='active' ORDER BY created_at DESC`,
    )
    .all() as SubscriberCsvRow[];
}
