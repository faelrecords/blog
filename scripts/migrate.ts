import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function migrate(targetValue: string, directory: string, label: string) {
  const target = path.resolve(targetValue);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const db = new Database(target);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const migrationDir = path.join(process.cwd(), directory);
  for (const file of fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    db.exec(fs.readFileSync(path.join(migrationDir, file), "utf8"));
  }
  console.log(`${label} preparado em ${target}`);
  db.close();
}

migrate(
  process.env.DATABASE_PATH || "./data/blog.sqlite",
  "drizzle",
  "Banco do blog",
);
migrate(
  process.env.NEWSLETTER_DATABASE_PATH || "./data/newsletter.sqlite",
  "newsletter-drizzle",
  "Banco da lista de e-mails",
);
