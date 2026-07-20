import { z } from "zod";

export type BuilderDevice = "desktop" | "tablet" | "mobile";
export type BuilderElementType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "video"
  | "quote"
  | "spacer"
  | "divider"
  | "hero"
  | "posts"
  | "categories"
  | "features"
  | "stats"
  | "testimonials"
  | "faq"
  | "cta";
export type BuilderStyle = {
  background?: string;
  color?: string;
  padding?: number;
  margin?: number;
  gap?: number;
  minHeight?: number;
  radius?: number;
  align?: "left" | "center" | "right";
  verticalAlign?: "start" | "center" | "end";
  fontSize?: number;
  shadow?: boolean;
};
export type BuilderElement = {
  id: string;
  type: BuilderElementType;
  content: Record<string, unknown>;
  style: BuilderStyle;
  responsive?: Partial<
    Record<
      BuilderDevice,
      { hidden?: boolean; padding?: number; fontSize?: number }
    >
  >;
};
export type BuilderColumn = {
  id: string;
  width: number;
  elements: BuilderElement[];
};
export type BuilderSection = {
  id: string;
  layout: "boxed" | "full";
  columns: BuilderColumn[];
  style: BuilderStyle;
  responsive?: Partial<
    Record<BuilderDevice, { hidden?: boolean; padding?: number }>
  >;
};
export type BuilderDocument = { version: 1; sections: BuilderSection[] };

const styleSchema = z
  .object({
    background: z.string().max(100).optional(),
    color: z.string().max(100).optional(),
    padding: z.number().min(0).max(160).optional(),
    margin: z.number().min(0).max(160).optional(),
    gap: z.number().min(0).max(120).optional(),
    minHeight: z.number().min(0).max(1200).optional(),
    radius: z.number().min(0).max(80).optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    verticalAlign: z.enum(["start", "center", "end"]).optional(),
    fontSize: z.number().min(10).max(100).optional(),
    shadow: z.boolean().optional(),
  })
  .strict();
const responsiveSchema = z.record(
  z.enum(["desktop", "tablet", "mobile"]),
  z
    .object({
      hidden: z.boolean().optional(),
      padding: z.number().min(0).max(120).optional(),
      fontSize: z.number().min(10).max(100).optional(),
    })
    .strict(),
);
const elementSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    type: z.enum([
      "heading",
      "text",
      "button",
      "image",
      "video",
      "quote",
      "spacer",
      "divider",
      "hero",
      "posts",
      "categories",
      "features",
      "stats",
      "testimonials",
      "faq",
      "cta",
    ]),
    content: z.record(z.string(), z.unknown()),
    style: styleSchema,
    responsive: responsiveSchema.optional(),
  })
  .strict();
const columnSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    width: z.number().min(10).max(100),
    elements: z.array(elementSchema).max(30),
  })
  .strict();
export const builderSectionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    layout: z.enum(["boxed", "full"]),
    columns: z.array(columnSchema).min(1).max(4),
    style: styleSchema,
    responsive: responsiveSchema.optional(),
  })
  .strict();
export const builderDocumentSchema = z
  .object({
    version: z.literal(1),
    sections: z.array(builderSectionSchema).max(50),
  })
  .strict();

export function uid(prefix = "item") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
export function emptyDocument(): BuilderDocument {
  return { version: 1, sections: [] };
}
export function parseBuilderDocument(
  value: string | null | undefined,
): BuilderDocument {
  try {
    const parsed = builderDocumentSchema.safeParse(JSON.parse(value || ""));
    return parsed.success ? (parsed.data as BuilderDocument) : emptyDocument();
  } catch {
    return emptyDocument();
  }
}
export function parsePairedItem(value: unknown) {
  const [title = "", ...description] = String(value ?? "").split("|");
  return { title: title.trim(), description: description.join("|").trim() };
}

export const ELEMENT_LIBRARY: {
  type: BuilderElementType;
  label: string;
  category: string;
  description: string;
  defaults: Record<string, unknown>;
}[] = [
  {
    type: "heading",
    label: "Título",
    category: "Conteúdo",
    description: "Título ou subtítulo",
    defaults: { text: "Novo título", level: 2 },
  },
  {
    type: "text",
    label: "Texto",
    category: "Conteúdo",
    description: "Parágrafo de conteúdo",
    defaults: { text: "Escreva seu conteúdo aqui." },
  },
  {
    type: "button",
    label: "Botão",
    category: "Conteúdo",
    description: "Botão com link",
    defaults: { label: "Saiba mais", url: "#" },
  },
  {
    type: "image",
    label: "Imagem",
    category: "Mídia",
    description: "Imagem com texto alternativo",
    defaults: { url: "", alt: "" },
  },
  {
    type: "video",
    label: "Vídeo",
    category: "Mídia",
    description: "Vídeo incorporado",
    defaults: { url: "https://www.youtube.com/embed/" },
  },
  {
    type: "quote",
    label: "Citação",
    category: "Conteúdo",
    description: "Frase em destaque",
    defaults: { text: "Uma frase relevante para destacar.", author: "" },
  },
  {
    type: "spacer",
    label: "Espaçador",
    category: "Estrutura",
    description: "Espaço vertical",
    defaults: { height: 40 },
  },
  {
    type: "divider",
    label: "Divisor",
    category: "Estrutura",
    description: "Linha separadora",
    defaults: {},
  },
  {
    type: "hero",
    label: "Hero",
    category: "Conversão",
    description: "Abertura com chamada",
    defaults: {
      eyebrow: "GTChat",
      title: "Transforme cada conversa",
      text: "Crie experiências melhores para seus clientes.",
      buttonLabel: "Conheça a GTChat",
      buttonUrl: "#",
    },
  },
  {
    type: "posts",
    label: "Artigos",
    category: "Blog",
    description: "Grade dinâmica de artigos",
    defaults: {
      title: "Conteúdos recentes",
      count: 3,
      columns: 3,
      category: "",
    },
  },
  {
    type: "categories",
    label: "Categorias",
    category: "Blog",
    description: "Categorias do blog",
    defaults: { title: "Explore por assunto", count: 4 },
  },
  {
    type: "features",
    label: "Benefícios",
    category: "Institucional",
    description: "Lista de benefícios",
    defaults: {
      title: "Por que escolher a GTChat",
      items: [
        "Atendimento unificado|Centralize todos os canais em uma única operação.",
        "Automação inteligente|Ganhe agilidade sem perder a qualidade do atendimento.",
        "Mais contexto|Tenha o histórico completo de cada conversa e cliente.",
      ],
    },
  },
  {
    type: "stats",
    label: "Indicadores",
    category: "Institucional",
    description: "Números em destaque",
    defaults: {
      items: ["98%|Satisfação", "24/7|Disponibilidade", "3x|Mais agilidade"],
    },
  },
  {
    type: "testimonials",
    label: "Depoimentos",
    category: "Institucional",
    description: "Prova social",
    defaults: {
      title: "Quem usa recomenda",
      quote: "A GTChat mudou a forma como atendemos nossos clientes.",
      author: "Cliente GTChat",
    },
  },
  {
    type: "faq",
    label: "Perguntas frequentes",
    category: "Conversão",
    description: "Lista de perguntas",
    defaults: {
      title: "Perguntas frequentes",
      items: [
        "Como funciona?|Centralize canais e automatize atendimentos.",
        "É fácil começar?|Sim, a implantação é acompanhada.",
      ],
    },
  },
  {
    type: "cta",
    label: "Chamada final",
    category: "Conversão",
    description: "Convite com botão",
    defaults: {
      title: "Pronto para transformar seu atendimento?",
      text: "Conecte todos os canais em uma experiência simples.",
      buttonLabel: "Falar com a GTChat",
      buttonUrl: "#",
    },
  },
];

export function createElement(type: BuilderElementType): BuilderElement {
  const item = ELEMENT_LIBRARY.find((entry) => entry.type === type)!;
  return {
    id: uid(type),
    type,
    content: structuredClone(item.defaults),
    style: {},
  };
}
export function createSection(
  element: BuilderElement,
  columns = 1,
): BuilderSection {
  return {
    id: uid("section"),
    layout: "boxed",
    columns: Array.from({ length: columns }, (_, index) => ({
      id: uid("column"),
      width: 100 / columns,
      elements: index === 0 ? [element] : [],
    })),
    style: { padding: 40 },
  };
}

export const SECTION_TEMPLATES: {
  id: string;
  name: string;
  category: string;
  description: string;
  create: () => BuilderSection;
}[] = [
  {
    id: "hero-brand",
    name: "Hero da marca",
    category: "Abertura",
    description: "Título, texto e chamada principal",
    create: () => createSection(createElement("hero")),
  },
  {
    id: "hero-centered",
    name: "Hero centralizado",
    category: "Abertura",
    description: "Chamada central e objetiva",
    create: () => {
      const section = createSection(createElement("hero"));
      section.columns[0].elements[0].style.align = "center";
      return section;
    },
  },
  {
    id: "latest-posts",
    name: "Artigos recentes",
    category: "Blog",
    description: "Grade dinâmica com três artigos",
    create: () => createSection(createElement("posts")),
  },
  {
    id: "category-posts",
    name: "Artigos por categoria",
    category: "Blog",
    description: "Grade filtrada por assunto",
    create: () => {
      const el = createElement("posts");
      el.content.category = "ia-e-bots";
      return createSection(el);
    },
  },
  {
    id: "features",
    name: "Benefícios",
    category: "Institucional",
    description: "Três diferenciais em colunas",
    create: () => createSection(createElement("features")),
  },
  {
    id: "numbers",
    name: "Indicadores",
    category: "Institucional",
    description: "Números e resultados",
    create: () => createSection(createElement("stats")),
  },
  {
    id: "testimonial",
    name: "Depoimento",
    category: "Prova social",
    description: "Citação de cliente",
    create: () => createSection(createElement("testimonials")),
  },
  {
    id: "faq",
    name: "FAQ",
    category: "Conversão",
    description: "Perguntas e respostas",
    create: () => createSection(createElement("faq")),
  },
  {
    id: "content-image",
    name: "Texto com imagem",
    category: "Conteúdo",
    description: "Duas colunas para conteúdo",
    create: () => {
      const section = createSection(createElement("text"), 2);
      section.columns[1].elements.push(createElement("image"));
      return section;
    },
  },
  {
    id: "final-cta",
    name: "Chamada final",
    category: "Conversão",
    description: "Bloco destacado com botão",
    create: () => createSection(createElement("cta")),
  },
];

export function defaultHomeDocument(): BuilderDocument {
  return {
    version: 1,
    sections: [
      SECTION_TEMPLATES[0].create(),
      SECTION_TEMPLATES[2].create(),
      SECTION_TEMPLATES[4].create(),
      SECTION_TEMPLATES[9].create(),
    ],
  };
}
