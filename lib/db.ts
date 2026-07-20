import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "@/lib/security";
import type { HomeBlockType } from "@/lib/theme";

const globalDb = globalThis as unknown as { gtchatDb?: Database.Database };

function createDb() {
  const databasePath = path.resolve(process.env.DATABASE_PATH || "./data/blog.sqlite");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const migration = fs.readFileSync(path.join(process.cwd(), "drizzle", "0000_initial.sql"), "utf8");
  db.exec(migration);
  const bootstrapUser = process.env.BOOTSTRAP_ADMIN_USERNAME?.trim().toLowerCase();
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (bootstrapUser && bootstrapPassword && bootstrapPassword.length >= 10) {
    const exists = db.prepare("SELECT 1 FROM users LIMIT 1").get();
    if (!exists) db.prepare("INSERT INTO users (name,username,password_hash,role,active,created_at) VALUES (?,?,?,?,1,?)").run(process.env.BOOTSTRAP_ADMIN_NAME || "Administrador", bootstrapUser, hashPassword(bootstrapPassword), "admin", new Date().toISOString());
  }
  return db;
}

export const db = globalDb.gtchatDb || createDb();
if (process.env.NODE_ENV !== "production") globalDb.gtchatDb = db;

export type SessionUser = { id: number; name: string; username: string; role: "admin" | "redator"; active: number };
export type PublicPost = {
  id: number; title: string; slug: string; excerpt: string; content_html: string; content_json: string;
  cover_image: string | null; cover_alt: string; tags_text: string; seo_title: string; seo_description: string;
  published_at: string | null; scheduled_at: string | null; featured: number; category_name: string | null;
  category_slug: string | null; category_color: string | null; author_name: string;
};

export function getSettings() {
  const rows = db.prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, string>;
}

export function getHomeBlocks() {
  return db.prepare("SELECT * FROM home_blocks WHERE type <> 'categories' ORDER BY position").all() as { id: string; type: HomeBlockType; title: string; enabled: number; position: number; config_json: string }[];
}

export function publicPosts(limit = 12, category?: string, query?: string) {
  const where = ["((p.status = 'publicado') OR (p.status = 'agendado' AND p.scheduled_at <= datetime('now')))" ];
  const params: unknown[] = [];
  if (category) { where.push("c.slug = ?"); params.push(category); }
  if (query) { where.push("(p.title LIKE ? OR p.excerpt LIKE ?)"); params.push(`%${query}%`, `%${query}%`); }
  params.push(limit);
  return db.prepare(`SELECT p.*, c.name category_name, c.slug category_slug, c.color category_color, u.name author_name FROM posts p JOIN users u ON u.id=p.author_id LEFT JOIN categories c ON c.id=p.category_id WHERE ${where.join(" AND ")} ORDER BY COALESCE(p.published_at,p.scheduled_at) DESC LIMIT ?`).all(...params) as PublicPost[];
}
