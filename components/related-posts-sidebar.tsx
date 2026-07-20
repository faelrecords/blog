"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { calculateArticleSidebarShift } from "@/lib/article-sidebar";
import type { PublicCategorySummary, PublicPost } from "@/lib/db";

export function RelatedPostsSidebar({
  posts,
  categoryName,
  categorySlug,
  categories,
  totalPosts,
}: {
  posts: PublicPost[];
  categoryName: string | null;
  categorySlug: string | null;
  categories: PublicCategorySummary[];
  totalPosts: number;
}) {
  const sidebarRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const track = trackRef.current;
    const layout = sidebar?.parentElement;
    if (!sidebar || !track || !layout) return;

    let animationFrame = 0;
    const updatePosition = () => {
      animationFrame = 0;
      if (!window.matchMedia("(min-width: 981px)").matches) {
        track.style.removeProperty("--article-sidebar-shift");
        return;
      }

      const layoutRect = layout.getBoundingClientRect();
      const shift = calculateArticleSidebarShift({
        scrollY: window.scrollY,
        layoutTop: layoutRect.top + window.scrollY,
        layoutHeight: layout.offsetHeight,
        viewportHeight: window.innerHeight,
        contentHeight: track.offsetHeight,
      });
      track.style.setProperty("--article-sidebar-shift", `${shift}px`);
    };
    const scheduleUpdate = () => {
      if (!animationFrame)
        animationFrame = window.requestAnimationFrame(updatePosition);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(layout);
    resizeObserver.observe(track);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updatePosition();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="article-sidebar"
      aria-label="Conteúdo complementar"
    >
      <div ref={trackRef} className="article-sidebar-track">
        <form
          className="article-sidebar-search"
          action="/artigos"
          role="search"
        >
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            name="q"
            aria-label="Pesquisar conteúdos"
            placeholder="Pesquisar conteúdos"
          />
          <button type="submit" aria-label="Pesquisar">
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
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
        <nav
          className="article-sidebar-categories"
          aria-labelledby="article-categories-title"
        >
          <h2 id="article-categories-title">Categorias</h2>
          <div className="article-category-list">
            <Link href="/artigos">
              <span>Todos os artigos</span>
              <strong aria-label={`${totalPosts} artigos`}>{totalPosts}</strong>
            </Link>
            {categories.map((category) => {
              const isCurrent = category.slug === categorySlug;
              return (
                <Link
                  href={`/artigos?categoria=${encodeURIComponent(category.slug)}`}
                  className={isCurrent ? "is-current" : undefined}
                  aria-current={isCurrent ? "page" : undefined}
                  key={category.id}
                >
                  <span>
                    <i
                      aria-hidden="true"
                      style={{ background: category.color || "var(--primary)" }}
                    />
                    {category.name}
                  </span>
                  <strong aria-label={`${category.post_count} artigos`}>
                    {category.post_count}
                  </strong>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
