import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/newsletter-db";
import { newsletterSignupSchema } from "@/lib/newsletter";
import { sameOrigin } from "@/lib/request";

const attempts = new Map<string, { count: number; until: number }>();
const SUCCESS_MESSAGE =
  "Cadastro realizado. Obrigado por acompanhar os conteúdos da GTChat!";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  let current = attempts.get(ip);
  if (current && current.until <= Date.now()) {
    attempts.delete(ip);
    current = undefined;
  }
  if (current && current.count >= 5 && current.until > Date.now())
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 },
    );
  attempts.set(ip, {
    count: (current?.count || 0) + 1,
    until: current?.until || Date.now() + 15 * 60_000,
  });

  const parsed = newsletterSignupSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Informe um e-mail válido e aceite o recebimento." },
      { status: 400 },
    );
  }

  if (parsed.data.website)
    return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
  subscribeToNewsletter({
    name: parsed.data.name,
    email: parsed.data.email,
    source: parsed.data.source,
  });
  return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
}
