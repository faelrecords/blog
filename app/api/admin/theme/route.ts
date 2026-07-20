import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db, getHomeBlocks, getSettings } from "@/lib/db";
import { sameOrigin } from "@/lib/request";

const configSchema = z.object({
  title: z.string().max(120).optional(), subtitle: z.string().max(240).optional(), text: z.string().max(800).optional(),
  buttonLabel: z.string().max(80).optional(), buttonUrl: z.string().max(500).optional(),
  count: z.number().int().min(1).max(6).optional(), columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  align: z.enum(["left", "center"]).optional(),
}).strict();
const blockSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/), type: z.enum(["hero", "latest", "text", "cta"]), title: z.string().min(1).max(100),
  enabled: z.boolean(), position: z.number().int().min(0).max(50), config_json: z.string().max(5000),
});
const schema = z.object({ settings: z.record(z.string(), z.string().max(1000)), blocks: z.array(blockSchema).max(20) });
const allowed = new Set(["logo_text", "logo_url", "favicon_url", "primary_color", "accent_color", "background_color", "text_color", "heading_font", "body_font", "cta_title", "cta_text", "cta_label", "cta_url"]);

export async function GET() {
  if (!await apiUser("admin")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({ settings: getSettings(), blocks: getHomeBlocks() });
}

export async function PUT(request: NextRequest) {
  const user = await apiUser("admin");
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Configuração inválida" }, { status: 400 });
  for (const block of parsed.data.blocks) {
    try { if (!configSchema.safeParse(JSON.parse(block.config_json)).success) throw new Error(); }
    catch { return NextResponse.json({ error: `Configuração inválida no bloco ${block.title}` }, { status: 400 }); }
  }

  const saveSetting = db.prepare("INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  const saveBlock = db.prepare(`INSERT INTO home_blocks (id,type,title,enabled,position,config_json) VALUES (?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,enabled=excluded.enabled,position=excluded.position,config_json=excluded.config_json`);
  db.transaction(() => {
    for (const [key, value] of Object.entries(parsed.data.settings)) if (allowed.has(key)) saveSetting.run(key, value);
    const ids = parsed.data.blocks.map((block) => block.id);
    for (const block of parsed.data.blocks) saveBlock.run(block.id, block.type, block.title, block.enabled ? 1 : 0, block.position, block.config_json);
    if (ids.length) db.prepare(`DELETE FROM home_blocks WHERE id NOT IN (${ids.map(() => "?").join(",")})`).run(...ids);
    else db.prepare("DELETE FROM home_blocks").run();
  })();
  db.prepare("INSERT INTO audit_log (user_id,action,entity,created_at) VALUES (?,?,?,?)").run(user.id, "editar", "tema", new Date().toISOString());
  return NextResponse.json({ ok: true });
}
