import { describe, expect, it } from "vitest";
import { sanitizePostHtml } from "./content";
describe("conteúdo editorial",()=>{it("remove scripts e manipuladores perigosos",()=>{const html=sanitizePostHtml('<p onclick="alert(1)">Seguro</p><script>alert(1)</script>');expect(html).toBe("<p>Seguro</p>");expect(html).not.toContain("script")})});
