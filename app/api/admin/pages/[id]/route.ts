import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { builderDocumentSchema } from "@/lib/page-builder";
import { sameOrigin } from "@/lib/request";
import { slugify } from "@/lib/security";

const saveSchema = z.object({ title: z.string().trim().min(2).max(120), slug: z.string().trim().min(1).max(120), seo_title: z.string().max(160), seo_description: z.string().max(320), document: builderDocumentSchema, mode: z.enum(["autosave", "save", "publish", "archive"]) });

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await apiUser("admin")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const page = db.prepare("SELECT * FROM pages WHERE id=?").get(id);
  if (!page) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const { id: rawId } = await params; const id = Number(rawId);
  const current = db.prepare("SELECT id,is_home,status FROM pages WHERE id=?").get(id) as { id: number; is_home: number; status: string } | undefined;
  if (!current) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  const parsed = saveSchema.safeParse(await request.json());
  if (!parsed.success || JSON.stringify(parsed.data?.document || {}).length > 300_000) return NextResponse.json({ error: "A página contém dados inválidos ou excede o limite." }, { status: 400 });
  const slug = slugify(parsed.data.slug);
  if (!slug) return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
  const duplicate = db.prepare("SELECT 1 FROM pages WHERE slug=? AND id<>?").get(slug, id);
  if (duplicate) return NextResponse.json({ error: "Este endereço já está sendo usado." }, { status: 409 });
  const now = new Date().toISOString(); const documentJson = JSON.stringify(parsed.data.document);
  const mode = parsed.data.mode; const status = mode === "publish" ? "publicado" : mode === "archive" ? "arquivado" : current.status === "arquivado" ? "rascunho" : current.status;
  db.transaction(() => {
    db.prepare(`UPDATE pages SET title=?,slug=?,seo_title=?,seo_description=?,draft_json=?,status=?,published_json=CASE WHEN ?='publish' THEN ? ELSE published_json END,published_at=CASE WHEN ?='publish' THEN ? ELSE published_at END,updated_at=? WHERE id=?`).run(parsed.data.title, slug, parsed.data.seo_title, parsed.data.seo_description, documentJson, status, mode, documentJson, mode, now, now, id);
    db.prepare("DELETE FROM page_sections WHERE page_id=?").run(id);
    const insertSection = db.prepare("INSERT INTO page_sections (id,page_id,position,section_json,updated_at) VALUES (?,?,?,?,?)");
    parsed.data.document.sections.forEach((section, position) => insertSection.run(section.id, id, position, JSON.stringify(section), now));
    if (mode === "save" || mode === "publish") db.prepare("INSERT INTO page_versions (page_id,document_json,label,created_by,created_at) VALUES (?,?,?,?,?)").run(id, documentJson, mode === "publish" ? "Publicação" : "Versão salva", user.id, now);
    db.prepare("INSERT INTO audit_log (user_id,action,entity,entity_id,created_at) VALUES (?,?,?,?,?)").run(user.id, mode, "pagina", String(id), now);
  })();
  return NextResponse.json({ ok: true, slug, status, saved_at: now });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const { id } = await params;
  const page = db.prepare("SELECT is_home FROM pages WHERE id=?").get(id) as { is_home: number } | undefined;
  if (!page) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  if (page.is_home) return NextResponse.json({ error: "A página inicial não pode ser excluída." }, { status: 409 });
  db.prepare("DELETE FROM pages WHERE id=?").run(id);
  db.prepare("INSERT INTO audit_log (user_id,action,entity,entity_id,created_at) VALUES (?,?,?,?,?)").run(user.id, "excluir", "pagina", id, new Date().toISOString());
  return NextResponse.json({ ok: true });
}
