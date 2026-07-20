import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  escapeCsvCell,
  newsletterSignupSchema,
  normalizeNewsletterSource,
  subscribersToCsv,
} from "./newsletter";

describe("newsletter", () => {
  it("normaliza e valida os dados públicos", () => {
    const parsed = newsletterSignupSchema.parse({
      name: "  Rafael  ",
      email: "  TESTE@EXAMPLE.COM ",
      consent: true,
      source: "/artigos/exemplo?origem=blog",
      website: "",
    });
    expect(parsed.name).toBe("Rafael");
    expect(parsed.email).toBe("teste@example.com");
    expect(normalizeNewsletterSource(parsed.source)).toBe(
      "/artigos/exemplo?origem=blog",
    );
  });

  it("recusa e-mail inválido ou consentimento ausente", () => {
    expect(
      newsletterSignupSchema.safeParse({
        name: "",
        email: "invalido",
        consent: false,
        source: "/",
        website: "",
      }).success,
    ).toBe(false);
  });

  it("gera CSV UTF-8 e neutraliza fórmulas", () => {
    const csv = subscribersToCsv([
      {
        name: "=PERIGOSO()",
        email: "leitor@example.com",
        status: "active",
        source_path: "/artigos/teste",
        consented_at: "2026-07-20T12:00:00.000Z",
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain(escapeCsvCell("'=PERIGOSO()"));
    expect(csv).toContain("leitor@example.com");
  });
});

describe("banco separado da newsletter", () => {
  let directory = "";
  let databasePath = "";

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "gtchat-newsletter-"));
    databasePath = path.join(directory, "newsletter.sqlite");
    process.env.NEWSLETTER_DATABASE_PATH = databasePath;
    vi.resetModules();
  });

  afterAll(() => {
    delete process.env.NEWSLETTER_DATABASE_PATH;
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it("cria, evita duplicidade e reativa um inscrito", async () => {
    const storage = await import("./newsletter-db");
    storage.subscribeToNewsletter({
      name: "Primeiro nome",
      email: "LEITOR@example.com",
      source: "/artigos/a",
    });
    storage.subscribeToNewsletter({
      name: "Nome atualizado",
      email: "leitor@example.com",
      source: "/artigos/b",
    });
    const before = storage.newsletterDb
      .prepare("SELECT * FROM subscribers")
      .all() as { id: number; name: string; status: string }[];
    expect(before).toHaveLength(1);
    expect(before[0].name).toBe("Nome atualizado");

    storage.newsletterDb
      .prepare("UPDATE subscribers SET status='inactive' WHERE id=?")
      .run(before[0].id);
    storage.subscribeToNewsletter({
      name: "",
      email: "leitor@example.com",
      source: "/artigos/c",
    });
    const after = storage.newsletterDb
      .prepare("SELECT status,source_path FROM subscribers WHERE id=?")
      .get(before[0].id) as { status: string; source_path: string };
    expect(after).toEqual({ status: "active", source_path: "/artigos/c" });
    expect(fs.existsSync(databasePath)).toBe(true);
    storage.newsletterDb.close();
  });
});
