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

export const DEFAULT_HOME_BLOCKS = [
  { id: "hero", type: "hero", title: "Artigo em destaque", enabled: true, position: 0, config_json: "{}" },
  { id: "latest", type: "latest", title: "Últimas publicações", enabled: true, position: 1, config_json: "{}" },
  { id: "categories", type: "categories", title: "Destaques por categoria", enabled: true, position: 2, config_json: "{}" },
  { id: "cta", type: "cta", title: "Chamada institucional", enabled: true, position: 3, config_json: "{}" },
];
