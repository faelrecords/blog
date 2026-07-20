import Link from "next/link";
import type { PublicPost } from "@/lib/db";

export function PostCard({ post }: { post: PublicPost }) {
  const date = new Date(post.published_at || post.scheduled_at || Date.now()).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
  return <article className="post-card"><Link href={`/artigos/${post.slug}`}><div className="post-card-image"><img src={post.cover_image || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"} alt={post.cover_alt}/><span className="chip" style={{background:post.category_color||undefined}}>{post.category_name || "GTChat"}</span></div><div className="post-card-body"><h3>{post.title}</h3><p>{post.excerpt}</p><div className="post-meta"><span>{post.author_name}</span><span>{date}</span></div></div></Link></article>;
}
