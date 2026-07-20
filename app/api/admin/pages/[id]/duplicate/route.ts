import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const { id } = await params;
  const page = db.prepare("SELECT * FROM pages WHERE id=?").get(id) as Record<string, unknown> | undefined;
  if (!page) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  const base = `${String(page.slug)}-copia`; let slug = base; let suffix = 2;
  while (db.prepare("SELECT 1 FROM pages WHERE slug=?").get(slug)) slug = `${base}-${suffix++}`;
  const now = new Date().toISOString();
  const result = db.prepare("INSERT INTO pages (title,slug,status,draft_json,seo_title,seo_description,author_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run(`${String(page.title)} (cópia)`, slug, "rascunho", String(page.draft_json), String(page.seo_title || ""), String(page.seo_description || ""), user.id, now, now);
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
