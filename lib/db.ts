import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "@/lib/security";
import type { HomeBlockType } from "@/lib/theme";
import { defaultHomeDocument, parseBuilderDocument } from "@/lib/page-builder";

const globalDb = globalThis as unknown as { gtchatDb?: Database.Database };

function createDb() {
  const databasePath = path.resolve(
    process.env.DATABASE_PATH || "./data/blog.sqlite",
  );
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const migrationDir = path.join(process.cwd(), "drizzle");
  for (const file of fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith(".sql"))
    .sort())
    db.exec(fs.readFileSync(path.join(migrationDir, file), "utf8"));
  const bootstrapUser =
    process.env.BOOTSTRAP_ADMIN_USERNAME?.trim().toLowerCase();
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (bootstrapUser && bootstrapPassword && bootstrapPassword.length >= 10) {
    const exists = db.prepare("SELECT 1 FROM users LIMIT 1").get();
    if (!exists)
      db.prepare(
        "INSERT INTO users (name,username,password_hash,role,active,created_at) VALUES (?,?,?,?,1,?)",
      ).run(
        process.env.BOOTSTRAP_ADMIN_NAME || "Administrador",
        bootstrapUser,
        hashPassword(bootstrapPassword),
        "admin",
        new Date().toISOString(),
      );
  }
  const firstAdmin = db
    .prepare("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1")
    .get() as { id: number } | undefined;
  const hasPage = db.prepare("SELECT 1 FROM pages LIMIT 1").get();
  if (firstAdmin && !hasPage) {
    const now = new Date().toISOString();
    const homeDocument = defaultHomeDocument();
    const document = JSON.stringify(homeDocument);
    const page = db
      .prepare(
        "INSERT INTO pages (title,slug,status,is_home,draft_json,published_json,author_id,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        "Página inicial",
        "inicio",
        "publicado",
        1,
        document,
        document,
        firstAdmin.id,
        now,
        now,
        now,
      );
    const insertSection = db.prepare(
      "INSERT INTO page_sections (id,page_id,position,section_json,updated_at) VALUES (?,?,?,?,?)",
    );
    homeDocument.sections.forEach((section, position) =>
      insertSection.run(
        section.id,
        page.lastInsertRowid,
        position,
        JSON.stringify(section),
        now,
      ),
    );
  }
  const pagesWithoutSections = db
    .prepare(
      "SELECT p.id,p.draft_json FROM pages p LEFT JOIN page_sections s ON s.page_id=p.id GROUP BY p.id HAVING COUNT(s.id)=0",
    )
    .all() as { id: number; draft_json: string }[];
  const backfillSection = db.prepare(
    "INSERT OR IGNORE INTO page_sections (id,page_id,position,section_json,updated_at) VALUES (?,?,?,?,?)",
  );
  for (const page of pagesWithoutSections)
    parseBuilderDocument(page.draft_json).sections.forEach(
      (section, position) =>
        backfillSection.run(
          section.id,
          page.id,
          position,
          JSON.stringify(section),
          new Date().toISOString(),
        ),
    );
  return db;
}

export const db = globalDb.gtchatDb || createDb();
if (process.env.NODE_ENV !== "production") globalDb.gtchatDb = db;

export type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: "admin" | "redator";
  active: number;
};
export type PublicPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  content_json: string;
  cover_image: string | null;
  cover_alt: string;
  tags_text: string;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  scheduled_at: string | null;
  featured: number;
  category_name: string | null;
  category_slug: string | null;
  category_color: string | null;
  author_name: string;
};

export function getSettings() {
  const rows = db.prepare("SELECT key, value FROM site_settings").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<
    string,
    string
  >;
}

export function getHomeBlocks() {
  return db
    .prepare(
      "SELECT * FROM home_blocks WHERE type <> 'categories' ORDER BY position",
    )
    .all() as {
    id: string;
    type: HomeBlockType;
    title: string;
    enabled: number;
    position: number;
    config_json: string;
  }[];
}

export function publicPosts(limit = 12, category?: string, query?: string) {
  const where = [
    "((p.status = 'publicado') OR (p.status = 'agendado' AND p.scheduled_at <= datetime('now')))",
  ];
  const params: unknown[] = [];
  if (category) {
    where.push("c.slug = ?");
    params.push(category);
  }
  if (query) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ?)");
    params.push(`%${query}%`, `%${query}%`);
  }
  params.push(limit);
  return db
    .prepare(
      `SELECT p.*, c.name category_name, c.slug category_slug, c.color category_color, u.name author_name FROM posts p JOIN users u ON u.id=p.author_id LEFT JOIN categories c ON c.id=p.category_id WHERE ${where.join(" AND ")} ORDER BY COALESCE(p.published_at,p.scheduled_at) DESC LIMIT ?`,
    )
    .all(...params) as PublicPost[];
}

export function relatedPublicPosts(
  postId: number,
  categorySlug: string | null,
  limit = 3,
) {
  const where = [
    "p.id <> ?",
    "((p.status = 'publicado') OR (p.status = 'agendado' AND p.scheduled_at <= datetime('now')))",
  ];
  const params: unknown[] = [postId];
  if (categorySlug) params.push(categorySlug);
  params.push(Math.min(6, Math.max(1, limit)));
  return db
    .prepare(
      `SELECT p.*, c.name category_name, c.slug category_slug, c.color category_color, u.name author_name
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where.join(" AND ")}
       ORDER BY ${categorySlug ? "CASE WHEN c.slug = ? THEN 0 ELSE 1 END," : ""}
                COALESCE(p.published_at, p.scheduled_at) DESC
       LIMIT ?`,
    )
    .all(...params) as PublicPost[];
}
