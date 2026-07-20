import { randomBytes } from "node:crypto";
import { db } from "../lib/db";
import { hashPassword } from "../lib/security";
const password = `Demo-${randomBytes(9).toString("base64url")}`;
const user = db.prepare("SELECT id FROM users WHERE username = ?").get("admin") as { id: number } | undefined;
if (!user) throw new Error("Usuário admin não encontrado. Execute primeiro npm run db:seed.");
db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), user.id);
db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
console.log(password);
