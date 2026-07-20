import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RelatedPostsSidebar } from "@/components/related-posts-sidebar";
import { db, relatedPublicPosts, type PublicPost } from "@/lib/db";

function findPost(slug: string) {
  return db
    .prepare(
      `SELECT p.*,c.name category_name,c.slug category_slug,c.color category_color,u.name author_name FROM posts p JOIN users u ON u.id=p.author_id LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=? AND ((p.status='publicado') OR (p.status='agendado' AND p.scheduled_at <= datetime('now')))`,
    )
    .get(slug) as PublicPost | undefined;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();
  const relatedPosts = relatedPublicPosts(post.id, post.category_slug, 3);
  const date = new Date(
    post.published_at || post.scheduled_at || Date.now(),
  ).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <>
      <SiteHeader />
      <main className="article-layout">
        <article className="article">
          <span
            className="chip"
            style={{
              background: post.category_color || undefined,
              color: "white",
            }}
          >
            {post.category_name}
          </span>
          <h1>{post.title}</h1>
          <p className="article-lead">{post.excerpt}</p>
          <div className="author">
            <span className="avatar">
              {post.author_name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{post.author_name}</strong>
              <small style={{ display: "block" }}>{date}</small>
            </div>
          </div>
          {post.cover_image && (
            <img
              className="article-cover"
              src={post.cover_image}
              alt={post.cover_alt}
            />
          )}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
          <div className="filters">
            {post.tags_text
              .split(",")
              .filter(Boolean)
              .map((tag) => (
                <span className="chip" key={tag}>
                  {tag.trim()}
                </span>
              ))}
          </div>
        </article>
        <RelatedPostsSidebar
          posts={relatedPosts}
          categoryName={post.category_name}
        />
      </main>
      <SiteFooter />
    </>
  );
}
