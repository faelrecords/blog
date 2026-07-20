import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page-renderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db, publicPosts } from "@/lib/db";
import { parseBuilderDocument } from "@/lib/page-builder";

type BuilderPage = { title: string; seo_title: string; seo_description: string; published_json: string | null };
function getPage(slug: string) { return db.prepare("SELECT title,seo_title,seo_description,published_json FROM pages WHERE slug=? AND status='publicado' AND is_home=0").get(slug) as BuilderPage | undefined; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = getPage(slug); if (!page) return {}; return { title: page.seo_title || page.title, description: page.seo_description || undefined }; }
export default async function PublicBuilderPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const page = getPage(slug); if (!page?.published_json) notFound(); const categories = db.prepare("SELECT c.id,c.name,c.slug,c.color,COUNT(p.id) total FROM categories c LEFT JOIN posts p ON p.category_id=c.id GROUP BY c.id ORDER BY total DESC").all() as { id: number; name: string; slug: string; color: string; total: number }[]; return <><SiteHeader/><main><PageRenderer document={parseBuilderDocument(page.published_json)} posts={publicPosts(12)} categories={categories}/></main><SiteFooter/></>; }
