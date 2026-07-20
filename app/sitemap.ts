import type { MetadataRoute } from "next";
import { publicPosts } from "@/lib/db";
export default function sitemap():MetadataRoute.Sitemap { const base=process.env.APP_URL||"http://localhost:3000";return [{url:base,lastModified:new Date()},{url:`${base}/artigos`,lastModified:new Date()},...publicPosts(1000).map(p=>({url:`${base}/artigos/${p.slug}`,lastModified:new Date(p.published_at||Date.now())}))] }
