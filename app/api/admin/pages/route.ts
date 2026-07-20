import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyDocument, SECTION_TEMPLATES } from "@/lib/page-builder";
import { sameOrigin } from "@/lib/request";
import { slugify } from "@/lib/security";

const createSchema = z.object({ title: z.string().trim().min(2).max(120), slug: z.string().trim().max(120).optional(), template: z.string().max(80).optional() });

export async function GET() {
  if (!await apiUser("admin")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const pages = db.prepare("SELECT id,title,slug,status,is_home,updated_at,published_at FROM pages ORDER BY is_home DESC,updated_at DESC").all();
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Informe um título válido." }, { status: 400 });
  const base = slugify(parsed.data.slug || parsed.data.title) || "pagina";
  let slug = base; let suffix = 2;
  while (db.prepare("SELECT 1 FROM pages WHERE slug=?").get(slug)) slug = `${base}-${suffix++}`;
  const template = SECTION_TEMPLATES.find((item) => item.id === parsed.data.template);
  const document = template ? { version: 1 as const, sections: [template.create()] } : emptyDocument();
  const now = new Date().toISOString();
  const result = db.transaction(() => {
    const page = db.prepare("INSERT INTO pages (title,slug,status,draft_json,author_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").run(parsed.data.title, slug, "rascunho", JSON.stringify(document), user.id, now, now);
    const insertSection = db.prepare("INSERT INTO page_sections (id,page_id,position,section_json,updated_at) VALUES (?,?,?,?,?)");
    document.sections.forEach((section, position) => insertSection.run(section.id, page.lastInsertRowid, position, JSON.stringify(section), now));
    return page;
  })();
  db.prepare("INSERT INTO audit_log (user_id,action,entity,entity_id,created_at) VALUES (?,?,?,?,?)").run(user.id, "criar", "pagina", String(result.lastInsertRowid), now);
  return NextResponse.json({ id: Number(result.lastInsertRowid), slug }, { status: 201 });
}
