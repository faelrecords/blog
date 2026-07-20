import { describe, expect, it } from "vitest";
import { calculateArticleSidebarShift } from "./article-sidebar";

const baseInput = {
  layoutTop: 100,
  layoutHeight: 3000,
  viewportHeight: 900,
  contentHeight: 1200,
};

describe("calculateArticleSidebarShift", () => {
  it("mantém o início do menu visível durante a primeira parte do artigo", () => {
    expect(calculateArticleSidebarShift({ ...baseInput, scrollY: 900 })).toBe(
      0,
    );
  });

  it("desloca o menu até o final durante a segunda parte do artigo", () => {
    expect(calculateArticleSidebarShift({ ...baseInput, scrollY: 2400 })).toBe(
      -412,
    );
  });

  it("não desloca menus que já cabem na janela", () => {
    expect(
      calculateArticleSidebarShift({
        ...baseInput,
        contentHeight: 600,
        scrollY: 2400,
      }),
    ).toBe(0);
  });
});
