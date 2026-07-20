import type { MetadataRoute } from "next";
import { db, publicPosts } from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "http://localhost:3000";
  const pages = db.prepare("SELECT slug,updated_at FROM pages WHERE status='publicado' AND is_home=0").all() as { slug: string; updated_at: string }[];
  return [{ url: base, lastModified: new Date() }, { url: `${base}/artigos`, lastModified: new Date() }, ...pages.map((page) => ({ url: `${base}/${page.slug}`, lastModified: new Date(page.updated_at) })), ...publicPosts(1000).map((post) => ({ url: `${base}/artigos/${post.slug}`, lastModified: new Date(post.published_at || Date.now()) }))];
}
