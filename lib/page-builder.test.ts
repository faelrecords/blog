import { describe, expect, it } from "vitest";
import {
  builderDocumentSchema,
  defaultHomeDocument,
  ELEMENT_LIBRARY,
  parseBuilderDocument,
  parsePairedItem,
  SECTION_TEMPLATES,
} from "./page-builder";

describe("construtor de páginas", () => {
  it("oferece uma biblioteca ampla de elementos e modelos", () => {
    expect(ELEMENT_LIBRARY.length).toBeGreaterThanOrEqual(12);
    expect(SECTION_TEMPLATES.length).toBeGreaterThanOrEqual(8);
  });

  it("gera uma página inicial válida", () => {
    expect(builderDocumentSchema.safeParse(defaultHomeDocument()).success).toBe(
      true,
    );
  });

  it("recusa documentos inválidos ao carregar", () => {
    expect(parseBuilderDocument('{"version":2,"sections":[]}')).toEqual({
      version: 1,
      sections: [],
    });
  });

  it("separa título e descrição de itens compostos", () => {
    expect(
      parsePairedItem("Atendimento|Todos os canais em um só lugar"),
    ).toEqual({
      title: "Atendimento",
      description: "Todos os canais em um só lugar",
    });
  });

  it("valida propriedades avançadas de seção", () => {
    const document = defaultHomeDocument();
    document.sections[0].style = {
      ...document.sections[0].style,
      background: "#0b1c30",
      color: "#ffffff",
      gap: 32,
      minHeight: 560,
      verticalAlign: "center",
    };
    expect(builderDocumentSchema.safeParse(document).success).toBe(true);
  });
});
