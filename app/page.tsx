import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCard } from "@/components/post-card";
import { db, getHomeBlocks, getSettings, publicPosts, type PublicPost } from "@/lib/db";

export default function HomePage() {
  const settings = getSettings();
  const posts = publicPosts(7);
  const featured = (posts.find((post) => post.featured) || posts[0]) as PublicPost | undefined;
  const categories = db.prepare("SELECT c.*, COUNT(p.id) total FROM categories c LEFT JOIN posts p ON p.category_id=c.id AND p.status IN ('publicado','agendado') GROUP BY c.id ORDER BY total DESC").all() as {id:number;name:string;slug:string;color:string;total:number}[];
  const blocks = getHomeBlocks().filter((block) => block.enabled);
  return <><SiteHeader/><main>
    {blocks.map((block) => {
      if (block.type === "hero" && featured) return <section className="hero-wrap" key={block.id}><div className="container hero"><div className="hero-content"><div className="eyebrow"><span className="chip">{featured.category_name}</span><span><Clock size={15} style={{display:"inline",verticalAlign:"-2px"}}/> 5 min de leitura</span></div><h1>{featured.title}</h1><p>{featured.excerpt}</p><div className="author-row"><div className="author"><span className="avatar">{featured.author_name.slice(0,2).toUpperCase()}</span><div><strong>{featured.author_name}</strong><small style={{display:"block"}}>Conteúdo GTChat</small></div></div><Link className="link-arrow" href={`/artigos/${featured.slug}`}>Ler artigo <ArrowRight size={18} style={{display:"inline",verticalAlign:"-4px"}}/></Link></div></div><Link className="hero-image" href={`/artigos/${featured.slug}`}><img src={featured.cover_image || ""} alt={featured.cover_alt}/></Link></div></section>;
      if (block.type === "latest") return <section className="section" key={block.id}><div className="container"><div className="section-heading"><div><h2>Conteúdos recentes</h2><p>Ideias práticas para equipes que querem atender melhor.</p></div><Link className="link-arrow" href="/artigos">Ver todos →</Link></div><div className="post-grid">{posts.filter((post)=>post.id!==featured?.id).slice(0,3).map(post=><PostCard post={post} key={post.id}/>)}</div></div></section>;
      if (block.type === "categories") return <section className="section" key={block.id}><div className="container"><div className="section-heading"><div><h2>Explore por assunto</h2><p>Encontre o conteúdo ideal para o seu momento.</p></div></div><div className="category-strip">{categories.slice(0,4).map(category=><Link href={`/artigos?categoria=${category.slug}`} className="category-tile" key={category.id}><div className="category-dot" style={{background:category.color}}/><h3>{category.name}</h3><span className="muted">{category.total} artigos</span></Link>)}</div></div></section>;
      if (block.type === "cta") return <section className="section" key={block.id}><div className="container cta"><div><h2>{settings.cta_title}</h2><p>{settings.cta_text}</p></div><a className="btn" href={settings.cta_url || "#"}>{settings.cta_label || "Saiba mais"} <ArrowRight size={18}/></a></div></section>;
      return null;
    })}
  </main><SiteFooter/></>;
}
