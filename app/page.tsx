import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCard } from "@/components/post-card";
import { getHomeBlocks, getSettings, publicPosts, type PublicPost } from "@/lib/db";
import { parseHomeBlockConfig } from "@/lib/theme";
import { db } from "@/lib/db";
import { parseBuilderDocument } from "@/lib/page-builder";
import { PageRenderer } from "@/components/page-renderer";

export default function HomePage() {
  const settings = getSettings();
  const posts = publicPosts(12);
  const builderPage = db.prepare("SELECT published_json FROM pages WHERE is_home=1 AND status='publicado'").get() as { published_json: string | null } | undefined;
  if (builderPage?.published_json) {
    const categories = db.prepare("SELECT c.id,c.name,c.slug,c.color,COUNT(p.id) total FROM categories c LEFT JOIN posts p ON p.category_id=c.id GROUP BY c.id ORDER BY total DESC").all() as { id: number; name: string; slug: string; color: string; total: number }[];
    return <><SiteHeader/><main><PageRenderer document={parseBuilderDocument(builderPage.published_json)} posts={posts} categories={categories}/></main><SiteFooter/></>;
  }
  const featured = (posts.find((post) => post.featured) || posts[0]) as PublicPost | undefined;
  const blocks = getHomeBlocks().filter((block) => block.enabled);

  return <><SiteHeader/><main>
    {blocks.map((block) => {
      const config = parseHomeBlockConfig(block.config_json);
      if (block.type === "hero" && featured) return <section className="hero-wrap" key={block.id}><div className="container hero"><div className="hero-content"><div className="eyebrow"><span className="chip">{featured.category_name}</span><span><Clock size={15} style={{display:"inline",verticalAlign:"-2px"}}/> 5 min de leitura</span></div><h1>{featured.title}</h1><p>{featured.excerpt}</p><div className="author-row"><div className="author"><span className="avatar">{featured.author_name.slice(0,2).toUpperCase()}</span><div><strong>{featured.author_name}</strong><small style={{display:"block"}}>Conteúdo GTChat</small></div></div><Link className="link-arrow" href={`/artigos/${featured.slug}`}>Ler artigo <ArrowRight size={18} style={{display:"inline",verticalAlign:"-4px"}}/></Link></div></div><Link className="hero-image" href={`/artigos/${featured.slug}`}><img src={featured.cover_image || ""} alt={featured.cover_alt}/></Link></div></section>;

      if (block.type === "latest") {
        const count = Math.min(6, Math.max(1, Number(config.count) || 3));
        const columns = [1, 2, 3].includes(Number(config.columns)) ? Number(config.columns) : 3;
        return <section className="section" key={block.id}><div className="container"><div className="section-heading"><div><h2>{config.title || "Conteúdos recentes"}</h2>{config.subtitle && <p>{config.subtitle}</p>}</div><Link className="link-arrow" href="/artigos">Ver todos →</Link></div><div className={`post-grid post-grid-columns-${columns}`}>{posts.filter((post)=>post.id!==featured?.id).slice(0,count).map((post)=><PostCard post={post} key={post.id}/>)}</div></div></section>;
      }

      if (block.type === "text") return <section className="section home-text-section" key={block.id}><div className={`container home-text-card align-${config.align === "center" ? "center" : "left"}`}><h2>{config.title || "Uma seção para sua mensagem"}</h2><p>{config.text || "Escreva aqui um texto curto e objetivo."}</p></div></section>;

      if (block.type === "cta") return <section className="section" key={block.id}><div className="container cta"><div><h2>{config.title || settings.cta_title}</h2><p>{config.text || settings.cta_text}</p></div><a className="btn" href={config.buttonUrl || settings.cta_url || "#"}>{config.buttonLabel || settings.cta_label || "Saiba mais"} <ArrowRight size={18}/></a></div></section>;
      return null;
    })}
  </main><SiteFooter/></>;
}
