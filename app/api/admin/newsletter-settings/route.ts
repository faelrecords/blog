import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import {
  getNewsletterSettings,
  saveNewsletterSettings,
} from "@/lib/newsletter-db";
import { newsletterSettingsSchema } from "@/lib/newsletter";
import { sameOrigin } from "@/lib/request";

export async function GET() {
  if (!(await apiUser("admin")))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(getNewsletterSettings());
}

export async function PUT(request: NextRequest) {
  if (!(await apiUser("admin")))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const parsed = newsletterSettingsSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Revise os textos informados." },
      { status: 400 },
    );
  saveNewsletterSettings({
    ...parsed.data,
    consent_version: `v${Date.now()}`,
  });
  return NextResponse.json({ ok: true, settings: getNewsletterSettings() });
}
