import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request";
import { slugify } from "@/lib/security";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

function listCategories() {
  return db.prepare(`SELECT c.id,c.name,c.slug,c.color,COUNT(p.id) count
    FROM categories c LEFT JOIN posts p ON p.category_id=c.id
    GROUP BY c.id ORDER BY c.name COLLATE NOCASE`).all();
}

export async function GET() {
  if (!await apiUser("admin")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({ categories: listCategories() });
}

export async function POST(request: NextRequest) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });

  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Informe um nome e uma cor válidos." }, { status: 400 });

  const base = slugify(parsed.data.name) || "categoria";
  let slug = base;
  let suffix = 2;
  while (db.prepare("SELECT 1 FROM categories WHERE slug=?").get(slug)) slug = `${base}-${suffix++}`;

  const result = db.prepare("INSERT INTO categories (name,slug,color) VALUES (?,?,?)").run(parsed.data.name, slug, parsed.data.color.toLowerCase());
  db.prepare("INSERT INTO audit_log (user_id,action,entity,entity_id,created_at) VALUES (?,?,?,?,?)")
    .run(user.id, "criar", "categoria", String(result.lastInsertRowid), new Date().toISOString());
  return NextResponse.json({ id: Number(result.lastInsertRowid), name: parsed.data.name, slug, color: parsed.data.color.toLowerCase(), count: 0 }, { status: 201 });
}
