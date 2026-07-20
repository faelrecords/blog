import { db } from "../lib/db";
import { hashPassword } from "../lib/security";
import { DEFAULT_HOME_BLOCKS, DEFAULT_THEME_SETTINGS } from "../lib/theme";
import { defaultHomeDocument } from "../lib/page-builder";

const now = new Date().toISOString();
const insertUser = db.prepare("INSERT OR IGNORE INTO users (name,username,password_hash,role,active,created_at) VALUES (?,?,?,?,1,?)");
insertUser.run("Administrador GTChat", "admin", hashPassword("GTChat@2026"), "admin", now);
insertUser.run("Marina Conteúdo", "redatora", hashPassword("Redatora@2026"), "redator", now);

const categories = [
  ["IA e Bots", "ia-e-bots", "#106e00"], ["WhatsApp", "whatsapp", "#006781"],
  ["Sucesso do Cliente", "sucesso-do-cliente", "#6b4eff"], ["Produto", "produto", "#d97706"],
];
const insertCategory = db.prepare("INSERT OR IGNORE INTO categories (name,slug,color) VALUES (?,?,?)");
for (const item of categories) insertCategory.run(...item);

const admin = db.prepare("SELECT id FROM users WHERE username='admin'").get() as { id: number };
const hasBuilderPage = db.prepare("SELECT 1 FROM pages LIMIT 1").get();
if (!hasBuilderPage) {
  const homeDocument = defaultHomeDocument();
  const document = JSON.stringify(homeDocument);
  const page = db.prepare("INSERT INTO pages (title,slug,status,is_home,draft_json,published_json,author_id,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").run("Página inicial", "inicio", "publicado", 1, document, document, admin.id, now, now, now);
  const insertSection = db.prepare("INSERT INTO page_sections (id,page_id,position,section_json,updated_at) VALUES (?,?,?,?,?)");
  homeDocument.sections.forEach((section, position) => insertSection.run(section.id, page.lastInsertRowid, position, JSON.stringify(section), now));
}
const rows = db.prepare("SELECT id,slug FROM categories").all() as { id: number; slug: string }[];
const categoryId = Object.fromEntries(rows.map((row) => [row.slug, row.id]));
const posts = [
  {
    title: "Como agentes de IA transformam o atendimento multicanal", slug: "agentes-ia-atendimento-multicanal",
    excerpt: "Descubra como equipes modernas conectam WhatsApp, redes sociais e chat em uma única experiência inteligente.", category: "ia-e-bots",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
    html: "<p>A inteligência artificial deixou de ser apenas uma promessa e passou a atuar ao lado das equipes de atendimento.</p><h2>Contexto em todos os canais</h2><p>Uma operação realmente multicanal preserva o histórico da conversa e oferece respostas consistentes, mesmo quando o cliente troca de canal.</p><blockquote>Automação eficiente não substitui o cuidado humano: ela libera tempo para que ele aconteça.</blockquote><h2>Comece pelos processos certos</h2><ul><li>Mapeie dúvidas repetitivas.</li><li>Defina quando transferir para uma pessoa.</li><li>Meça resolução e satisfação.</li></ul>"
  },
  {
    title: "WhatsApp Business API: guia para crescer com qualidade", slug: "whatsapp-business-api-guia",
    excerpt: "Templates, opt-ins e boas práticas para criar conversas úteis sem perder proximidade.", category: "whatsapp",
    cover: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1600&q=85",
    html: "<p>O WhatsApp é um canal decisivo para empresas brasileiras. Com processos claros, ele aproxima atendimento, vendas e sucesso do cliente.</p><h2>Respeite o contexto</h2><p>Mensagens relevantes começam com consentimento, linguagem direta e uma rota simples para falar com uma pessoa.</p>"
  },
  {
    title: "Cinco métricas essenciais para equipes de suporte", slug: "metricas-equipes-suporte",
    excerpt: "Um painel enxuto para acompanhar velocidade, qualidade e impacto sem se perder em números.", category: "sucesso-do-cliente",
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
    html: "<p>Métricas devem apoiar decisões. Tempo de primeira resposta, resolução, reabertura, satisfação e volume por motivo formam um excelente ponto de partida.</p>"
  },
  {
    title: "Caixa de entrada unificada: menos abas, mais contexto", slug: "caixa-entrada-unificada",
    excerpt: "Veja como centralizar canais reduz troca de contexto e acelera a resolução de cada conversa.", category: "produto",
    cover: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=85",
    html: "<p>Quando toda a equipe enxerga a mesma linha do tempo, as conversas fluem melhor e o cliente não precisa repetir informações.</p>"
  },
];
const insertPost = db.prepare(`INSERT OR IGNORE INTO posts (title,slug,excerpt,content_json,content_html,cover_image,cover_alt,status,author_id,category_id,tags_text,seo_title,seo_description,featured,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
posts.forEach((post, index) => insertPost.run(post.title, post.slug, post.excerpt, JSON.stringify({ type: "doc", content: [] }), post.html, post.cover, post.title, "publicado", admin.id, categoryId[post.category], "IA, Atendimento, GTChat", post.title, post.excerpt, index === 0 ? 1 : 0, new Date(Date.now() - index * 86400000 * 3).toISOString(), now, now));

const setSetting = db.prepare("INSERT OR IGNORE INTO site_settings (key,value) VALUES (?,?)");
Object.entries(DEFAULT_THEME_SETTINGS).forEach(([key, value]) => setSetting.run(key, value));

const block = db.prepare("INSERT OR IGNORE INTO home_blocks (id,type,title,enabled,position,config_json) VALUES (?,?,?,?,?,?)");
DEFAULT_HOME_BLOCKS.forEach((item) => block.run(item.id, item.type, item.title, item.enabled ? 1 : 0, item.position, item.config_json));
console.log("Dados de demonstração criados. Admin: admin / GTChat@2026 | Redator: redatora / Redatora@2026");
