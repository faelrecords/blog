import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const target = path.resolve(process.env.DATABASE_PATH || "./data/blog.sqlite");
fs.mkdirSync(path.dirname(target), { recursive: true });
const db = new Database(target);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(path.join(process.cwd(), "drizzle", "0000_initial.sql"), "utf8"));
console.log(`Banco preparado em ${target}`);
db.close();
