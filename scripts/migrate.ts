import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const target = path.resolve(process.env.DATABASE_PATH || "./data/blog.sqlite");
fs.mkdirSync(path.dirname(target), { recursive: true });
const db = new Database(target);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
const migrationDir = path.join(process.cwd(), "drizzle");
for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort()) db.exec(fs.readFileSync(path.join(migrationDir, file), "utf8"));
console.log(`Banco preparado em ${target}`);
db.close();
