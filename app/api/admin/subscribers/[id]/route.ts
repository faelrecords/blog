import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { newsletterDb, type Subscriber } from "@/lib/newsletter-db";
import { subscriberUpdateSchema } from "@/lib/newsletter";
import { sameOrigin } from "@/lib/request";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await apiUser("admin")))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const id = Number((await params).id);
  const parsed = subscriberUpdateSchema.safeParse(await request.json());
  if (!Number.isInteger(id) || !parsed.success)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const existing = newsletterDb
    .prepare("SELECT * FROM subscribers WHERE id=?")
    .get(id) as Subscriber | undefined;
  if (!existing)
    return NextResponse.json(
      { error: "Inscrito não encontrado" },
      { status: 404 },
    );

  const next = { ...existing, ...parsed.data };
  const now = new Date().toISOString();
  try {
    newsletterDb.transaction(() => {
      newsletterDb
        .prepare(
          "UPDATE subscribers SET name=?,email=?,status=?,updated_at=? WHERE id=?",
        )
        .run(next.name, next.email, next.status, now, id);
      const event =
        parsed.data.status && parsed.data.status !== existing.status
          ? parsed.data.status === "active"
            ? "activated"
            : "deactivated"
          : "updated";
      newsletterDb
        .prepare(
          "INSERT INTO subscriber_events (subscriber_id,event,metadata_json,created_at) VALUES (?,?,?,?)",
        )
        .run(id, event, JSON.stringify({ admin: true }), now);
    })();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Este e-mail já está cadastrado." },
      { status: 409 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await apiUser("admin")))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isInteger(id))
    return NextResponse.json(
      { error: "Identificador inválido" },
      { status: 400 },
    );
  const result = newsletterDb
    .prepare("DELETE FROM subscribers WHERE id=?")
    .run(id);
  if (!result.changes)
    return NextResponse.json(
      { error: "Inscrito não encontrado" },
      { status: 404 },
    );
  return NextResponse.json({ ok: true });
}
