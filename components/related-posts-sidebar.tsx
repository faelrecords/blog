import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicPost } from "@/lib/db";

export function RelatedPostsSidebar({
  posts,
  categoryName,
}: {
  posts: PublicPost[];
  categoryName: string | null;
}) {
  return (
    <aside className="article-sidebar" aria-labelledby="related-posts-title">
      <div className="article-sidebar-inner">
        <span className="article-sidebar-kicker">
          {categoryName || "Continue lendo"}
        </span>
        <h2 id="related-posts-title">Artigos relacionados</h2>
        {posts.length ? (
          <div className="related-post-list">
            {posts.map((post) => {
              const date = new Date(
                post.published_at || post.scheduled_at || Date.now(),
              ).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              });
              return (
                <Link
                  className="related-post-card"
                  href={`/artigos/${post.slug}`}
                  key={post.id}
                >
                  <img
                    src={
                      post.cover_image ||
                      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={post.cover_alt || ""}
                  />
                  <span>
                    <small>
                      {post.category_name || "GTChat"} · {date}
                    </small>
                    <strong>{post.title}</strong>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="related-posts-empty">
            Ainda não há outros artigos publicados nesta categoria.
          </p>
        )}
        <Link className="article-sidebar-all" href="/artigos">
          Ver todos os artigos <ArrowRight size={16} />
        </Link>
      </div>
    </aside>
  );
}
