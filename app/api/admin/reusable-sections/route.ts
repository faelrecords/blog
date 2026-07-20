import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { builderSectionSchema } from "@/lib/page-builder";
import { sameOrigin } from "@/lib/request";

const schema = z.object({ name: z.string().trim().min(2).max(100), section: builderSectionSchema });
export async function GET() { if (!await apiUser("admin")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); return NextResponse.json({ sections: db.prepare("SELECT id,name,section_json,updated_at FROM reusable_sections ORDER BY name").all() }); }
export async function POST(request: NextRequest) { const user = await apiUser("admin"); if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Modelo inválido" }, { status: 400 }); const now = new Date().toISOString(); const result = db.prepare("INSERT INTO reusable_sections (name,section_json,created_by,created_at,updated_at) VALUES (?,?,?,?,?)").run(parsed.data.name, JSON.stringify(parsed.data.section), user.id, now, now); return NextResponse.json({ id: Number(result.lastInsertRowid), name: parsed.data.name, section_json: JSON.stringify(parsed.data.section), updated_at: now }, { status: 201 }); }
