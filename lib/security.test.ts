import { describe, expect, it } from "vitest";
import { hashPassword, slugify, verifyPassword } from "./security";

describe("segurança básica", () => {
  it("protege e valida senhas", () => {
    const hash = hashPassword("uma-senha-segura");
    expect(hash).not.toContain("uma-senha-segura");
    expect(verifyPassword("uma-senha-segura", hash)).toBe(true);
    expect(verifyPassword("errada", hash)).toBe(false);
  });
  it("gera slugs em português", () => expect(slugify("IA & Conversação: visão geral")).toBe("ia-conversacao-visao-geral"));
});
