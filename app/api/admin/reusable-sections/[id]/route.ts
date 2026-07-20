import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request";
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const user = await apiUser("admin"); if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 }); const { id } = await params; db.prepare("DELETE FROM reusable_sections WHERE id=?").run(id); return NextResponse.json({ ok: true }); }
