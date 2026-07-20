import { describe, expect, it } from "vitest";
import { DEFAULT_HOME_BLOCKS, HOME_BLOCK_LIBRARY, parseHomeBlockConfig } from "./theme";

describe("configuração da página inicial", () => {
  it("não inclui a antiga seção de assuntos", () => {
    expect(DEFAULT_HOME_BLOCKS.some((block) => block.type === ("categories" as never))).toBe(false);
    expect(HOME_BLOCK_LIBRARY.map((block) => block.type)).toEqual(["hero", "latest", "text", "cta"]);
  });

  it("lê apenas JSON de configuração válido", () => {
    expect(parseHomeBlockConfig('{"count":3,"columns":2}')).toEqual({ count: 3, columns: 2 });
    expect(parseHomeBlockConfig("texto inválido")).toEqual({});
    expect(parseHomeBlockConfig("[]")).toEqual({});
  });
});
