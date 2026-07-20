import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await apiUser("admin")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const versions = db.prepare("SELECT v.id,v.label,v.created_at,u.name author_name FROM page_versions v JOIN users u ON u.id=v.created_by WHERE v.page_id=? ORDER BY v.id DESC LIMIT 30").all(id);
  return NextResponse.json({ versions });
}
