import sanitizeHtml from "sanitize-html";

export function sanitizePostHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li", "a", "img", "pre", "code", "br", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "title"] },
    allowedSchemes: ["http", "https"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}
