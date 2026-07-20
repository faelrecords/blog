import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { db } from "../lib/db";
import { hashPassword } from "../lib/security";

const prompt = readline.createInterface({ input, output });
const name = (await prompt.question("Nome do administrador: ")).trim();
const username = (await prompt.question("Usuário: ")).trim().toLowerCase();
const password = await prompt.question("Senha (mínimo 10 caracteres): ");
prompt.close();
if (!name || !/^[a-z0-9._-]{3,32}$/.test(username) || password.length < 10) throw new Error("Dados inválidos.");
db.prepare("INSERT INTO users (name,username,password_hash,role,active,created_at) VALUES (?,?,?,?,1,?)").run(name, username, hashPassword(password), "admin", new Date().toISOString());
console.log("Administrador criado.");
