import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const { id, versionId } = await params;
  const version = db.prepare("SELECT document_json FROM page_versions WHERE id=? AND page_id=?").get(versionId, id) as { document_json: string } | undefined;
  if (!version) return NextResponse.json({ error: "Versão não encontrada" }, { status: 404 });
  db.prepare("UPDATE pages SET draft_json=?,updated_at=? WHERE id=?").run(version.document_json, new Date().toISOString(), id);
  return NextResponse.json({ ok: true, document: JSON.parse(version.document_json) });
}
