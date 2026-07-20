import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  const category = db.prepare("SELECT id,name FROM categories WHERE id=?").get(id) as { id: number; name: string } | undefined;
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  const affected = (db.prepare("SELECT COUNT(*) count FROM posts WHERE category_id=?").get(id) as { count: number }).count;
  db.transaction(() => {
    db.prepare("UPDATE posts SET category_id=NULL WHERE category_id=?").run(id);
    db.prepare("DELETE FROM categories WHERE id=?").run(id);
    db.prepare("INSERT INTO audit_log (user_id,action,entity,entity_id,created_at) VALUES (?,?,?,?,?)")
      .run(user.id, "excluir", "categoria", String(id), new Date().toISOString());
  })();
  return NextResponse.json({ ok: true, affected_posts: affected });
}
