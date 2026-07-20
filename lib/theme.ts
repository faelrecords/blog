export const DEFAULT_THEME_SETTINGS: Record<string, string> = {
  site_title: "GTChat Blog",
  site_description: "Estratégias, tendências e práticas para um atendimento mais inteligente.",
  logo_text: "GTChat",
  logo_url: "",
  favicon_url: "",
  primary_color: "#106e00",
  accent_color: "#006781",
  background_color: "#f8f9ff",
  text_color: "#0b1c30",
  heading_font: "Hanken Grotesk",
  body_font: "Inter",
  footer_text: "Conteúdo para transformar conversas em resultados.",
  linkedin_url: "https://linkedin.com",
  instagram_url: "https://instagram.com",
  cta_title: "Pronto para transformar seu atendimento?",
  cta_text: "Conheça a GTChat e conecte todos os seus canais em uma experiência simples.",
  cta_label: "Conhecer a GTChat",
  cta_url: "https://vibecodex.pro",
};

export type HomeBlockType = "hero" | "latest" | "text" | "cta";

export type HomeBlockConfig = {
  title?: string;
  subtitle?: string;
  text?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  count?: number;
  columns?: 1 | 2 | 3;
  align?: "left" | "center";
};

export const HOME_BLOCK_LIBRARY: { type: HomeBlockType; title: string; description: string; defaultConfig: HomeBlockConfig }[] = [
  { type: "hero", title: "Artigo em destaque", description: "Capa grande usando o artigo marcado como destaque.", defaultConfig: {} },
  { type: "latest", title: "Grade de artigos", description: "Lista configurável com as publicações mais recentes.", defaultConfig: { title: "Conteúdos recentes", subtitle: "Ideias práticas para equipes que querem atender melhor.", count: 3, columns: 3 } },
  { type: "text", title: "Texto institucional", description: "Título e texto livre para apresentar uma ideia.", defaultConfig: { title: "Uma seção para sua mensagem", text: "Escreva aqui um texto curto e objetivo.", align: "left" } },
  { type: "cta", title: "Chamada com botão", description: "Bloco de conversão com texto, link e botão.", defaultConfig: {} },
];

export const DEFAULT_HOME_BLOCKS = [
  { id: "hero", type: "hero" as HomeBlockType, title: "Artigo em destaque", enabled: true, position: 0, config_json: "{}" },
  { id: "latest", type: "latest" as HomeBlockType, title: "Grade de artigos", enabled: true, position: 1, config_json: JSON.stringify(HOME_BLOCK_LIBRARY[1].defaultConfig) },
  { id: "cta", type: "cta" as HomeBlockType, title: "Chamada com botão", enabled: true, position: 2, config_json: "{}" },
];

export function parseHomeBlockConfig(value: string): HomeBlockConfig {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as HomeBlockConfig : {};
  } catch {
    return {};
  }
}
