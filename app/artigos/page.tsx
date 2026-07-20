import Link from "next/link";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCard } from "@/components/post-card";
import { db, publicPosts } from "@/lib/db";

export const metadata = { title: "Artigos" };
export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string; categoria?: string }> }) {
  const params = await searchParams; const posts=publicPosts(60,params.categoria,params.q);
  const categories=db.prepare("SELECT * FROM categories ORDER BY name").all() as {id:number;name:string;slug:string}[];
  return <><SiteHeader/><main className="container"><header className="archive-head"><h1>Recursos e insights GTChat</h1><p>Estratégias, tendências de IA e experiências para elevar cada conversa.</p><div className="filters"><form className="search-form"><input className="input" name="q" defaultValue={params.q} placeholder="Pesquisar artigos..."/><button className="btn btn-primary"><Search size={18}/> Buscar</button></form></div><div className="filters"><Link className={`chip ${!params.categoria?"active":""}`} href="/artigos">Todos os assuntos</Link>{categories.map(c=><Link className="chip" href={`/artigos?categoria=${c.slug}`} key={c.id}>{c.name}</Link>)}</div></header><section className="section" style={{paddingTop:12}}>{posts.length?<div className="post-grid">{posts.map(post=><PostCard post={post} key={post.id}/>)}</div>:<div className="empty"><h2>Nenhum artigo encontrado</h2><p>Tente outro termo ou remova os filtros.</p></div>}</section></main><SiteFooter/></>;
}
