import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, type SessionUser } from "@/lib/db";
import { tokenHash } from "@/lib/security";

export const SESSION_COOKIE = "gtchat_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = db.prepare(`SELECT u.id,u.name,u.username,u.role,u.active FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > datetime('now') AND u.active=1`).get(tokenHash(token)) as SessionUser | undefined;
  return user || null;
}

export async function requireUser(role?: "admin") {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (role === "admin" && user.role !== "admin") redirect("/publicar");
  return user;
}

export async function apiUser(role?: "admin") {
  const user = await getCurrentUser();
  if (!user || (role === "admin" && user.role !== "admin")) return null;
  return user;
}
