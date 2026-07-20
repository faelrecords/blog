import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Plus,
  Quote,
  Settings2,
  Trash2,
} from "lucide-react";
import { PostCard } from "@/components/post-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import type { PublicPost } from "@/lib/db";
import {
  parsePairedItem,
  type BuilderDocument,
  type BuilderElement,
  type BuilderSection,
} from "@/lib/page-builder";

const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const safeUrl = (value: unknown, fallback = "#") => {
  const url = text(value);
  return /^(https?:\/\/|\/|#)/i.test(url) ? url : fallback;
};
const safeColor = (value: unknown) =>
  typeof value === "string" &&
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|transparent)$/i.test(value)
    ? value
    : undefined;
const list = (value: unknown) =>
  Array.isArray(value) ? value.map(String).slice(0, 12) : [];

function styleOf(item: { style: BuilderElement["style"] }) {
  const style = item.style || {};
  return {
    background: safeColor(style.background),
    color: safeColor(style.color),
    padding:
      style.padding !== undefined
        ? `${Math.min(160, Math.max(0, style.padding))}px`
        : undefined,
    marginBlock:
      style.margin !== undefined
        ? `${Math.min(160, Math.max(0, style.margin))}px`
        : undefined,
    borderRadius:
      style.radius !== undefined
        ? `${Math.min(80, Math.max(0, style.radius))}px`
        : undefined,
    minHeight:
      style.minHeight !== undefined
        ? `${Math.min(1200, Math.max(0, style.minHeight))}px`
        : undefined,
    textAlign: style.align,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    boxShadow: style.shadow ? "0 16px 40px rgba(9,30,50,.12)" : undefined,
  } as React.CSSProperties;
}
function responsiveClasses(item: {
  responsive?: BuilderElement["responsive"];
}) {
  return (["desktop", "tablet", "mobile"] as const)
    .filter((device) => item.responsive?.[device]?.hidden)
    .map((device) => `hide-${device}`)
    .join(" ");
}

type PageCategory = {
  id: number;
  name: string;
  slug: string;
  color: string;
  total: number;
};
export function PageRenderer({
  document,
  previewDevice,
  posts = [],
  categories = [],
  selectedSectionId,
  selectedElementId,
  editable = false,
  dropTargetId,
  onAddSectionAfter,
  onMoveSection,
  onDuplicateSection,
  onRemoveSection,
  onSelectSection,
}: {
  document: BuilderDocument;
  previewDevice?: "desktop" | "tablet" | "mobile";
  posts?: PublicPost[];
  categories?: PageCategory[];
  selectedSectionId?: string;
  selectedElementId?: string;
  editable?: boolean;
  dropTargetId?: string;
  onAddSectionAfter?: (sectionId: string) => void;
  onMoveSection?: (sectionId: string, delta: number) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onRemoveSection?: (sectionId: string) => void;
  onSelectSection?: (sectionId: string) => void;
}) {
  return (
    <div
      className={`built-page ${previewDevice ? `builder-preview-${previewDevice}` : ""}`}
    >
      {document.sections.map((section, index) => (
        <SectionRenderer
          key={section.id}
          section={section}
          posts={posts}
          categories={categories}
          selectedSectionId={selectedSectionId}
          selectedElementId={selectedElementId}
          editable={editable}
          dropTargetId={dropTargetId}
          index={index}
          sectionCount={document.sections.length}
          onAddSectionAfter={onAddSectionAfter}
          onMoveSection={onMoveSection}
          onDuplicateSection={onDuplicateSection}
          onRemoveSection={onRemoveSection}
          onSelectSection={onSelectSection}
        />
      ))}
    </div>
  );
}
function SectionRenderer({
  section,
  posts,
  categories,
  selectedSectionId,
  selectedElementId,
  editable,
  dropTargetId,
  index,
  sectionCount,
  onAddSectionAfter,
  onMoveSection,
  onDuplicateSection,
  onRemoveSection,
  onSelectSection,
}: {
  section: BuilderSection;
  posts: PublicPost[];
  categories: PageCategory[];
  selectedSectionId?: string;
  selectedElementId?: string;
  editable: boolean;
  dropTargetId?: string;
  index: number;
  sectionCount: number;
  onAddSectionAfter?: (sectionId: string) => void;
  onMoveSection?: (sectionId: string, delta: number) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onRemoveSection?: (sectionId: string) => void;
  onSelectSection?: (sectionId: string) => void;
}) {
  const widths = section.columns.map((column) => `${column.width}fr`).join(" ");
  return (
    <section
      className={`built-section built-${section.layout} ${responsiveClasses(section)} ${selectedSectionId === section.id ? "builder-selected-section" : ""}`}
      style={styleOf(section)}
      data-section={section.id}
    >
      {editable && (
        <div className="builder-section-toolbar" aria-label="Ações da seção">
          <button
            type="button"
            title="Editar seção"
            aria-label="Editar seção"
            onClick={(event) => {
              event.stopPropagation();
              onSelectSection?.(section.id);
            }}
          >
            <Settings2 />
          </button>
          <button
            type="button"
            title="Mover seção para cima"
            aria-label="Mover seção para cima"
            disabled={index === 0}
            onClick={(event) => {
              event.stopPropagation();
              onMoveSection?.(section.id, -1);
            }}
          >
            <ArrowUp />
          </button>
          <button
            type="button"
            title="Mover seção para baixo"
            aria-label="Mover seção para baixo"
            disabled={index === sectionCount - 1}
            onClick={(event) => {
              event.stopPropagation();
              onMoveSection?.(section.id, 1);
            }}
          >
            <ArrowDown />
          </button>
          <button
            type="button"
            title="Duplicar seção"
            aria-label="Duplicar seção"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicateSection?.(section.id);
            }}
          >
            <Copy />
          </button>
          <button
            type="button"
            title="Excluir seção"
            aria-label="Excluir seção"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveSection?.(section.id);
            }}
          >
            <Trash2 />
          </button>
        </div>
      )}
      <div
        className="built-section-inner"
        style={{
          gridTemplateColumns: widths,
          gap:
            section.style.gap !== undefined
              ? `${section.style.gap}px`
              : undefined,
          alignItems: section.style.verticalAlign,
        }}
      >
        {section.columns.map((column) => (
          <div
            className={`built-column ${dropTargetId === column.id ? "builder-drop-target" : ""}`}
            data-column={column.id}
            key={column.id}
          >
            {column.elements.map((element) => (
              <div
                draggable={editable}
                className={`built-element ${responsiveClasses(element)} ${selectedElementId === element.id ? "builder-selected-element" : ""} ${dropTargetId === element.id ? "builder-drop-target" : ""}`}
                data-element={element.id}
                key={element.id}
              >
                <ElementRenderer
                  element={element}
                  posts={posts}
                  categories={categories}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      {editable && (
        <button
          type="button"
          className="builder-add-section"
          onClick={(event) => {
            event.stopPropagation();
            onAddSectionAfter?.(section.id);
          }}
        >
          <Plus /> Adicionar seção aqui
        </button>
      )}
    </section>
  );
}

function ElementRenderer({
  element,
  posts,
  categories,
}: {
  element: BuilderElement;
  posts: PublicPost[];
  categories: PageCategory[];
}) {
  const content = element.content;
  const style = styleOf(element);
  const horizontalPlacement =
    element.style.align === "center"
      ? "center"
      : element.style.align === "right"
        ? "end"
        : "start";
  const alignedGridStyle = {
    ...style,
    justifyItems: horizontalPlacement,
  } as React.CSSProperties;
  if (element.type === "heading") {
    const level = Math.min(4, Math.max(1, number(content.level, 2)));
    const Tag = `h${level}` as "h1";
    return (
      <Tag className="built-heading" style={style}>
        {text(content.text, "Novo título")}
      </Tag>
    );
  }
  if (element.type === "text")
    return (
      <p className="built-text" style={style}>
        {text(content.text)}
      </p>
    );
  if (element.type === "button")
    return (
      <div
        className="built-button-wrap"
        style={{ textAlign: element.style.align }}
      >
        <Link
          className="built-button"
          href={safeUrl(content.url)}
          style={style}
        >
          {text(content.label, "Saiba mais")} <ArrowRight size={17} />
        </Link>
      </div>
    );
  if (element.type === "image") {
    const url = safeUrl(content.url, "");
    return url ? (
      <img
        className="built-image"
        style={style}
        src={url}
        alt={text(content.alt)}
      />
    ) : (
      <div className="built-placeholder" style={style}>
        Selecione uma imagem
      </div>
    );
  }
  if (element.type === "video") {
    const url = safeUrl(content.url, "");
    return url &&
      /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i.test(
        url,
      ) ? (
      <div className="built-video">
        <iframe
          src={url}
          title={text(content.title, "Vídeo")}
          loading="lazy"
          allowFullScreen
        />
      </div>
    ) : (
      <div className="built-placeholder">
        Informe uma URL incorporável do YouTube ou Vimeo
      </div>
    );
  }
  if (element.type === "quote")
    return (
      <blockquote className="built-quote" style={alignedGridStyle}>
        <Quote />
        <p>{text(content.text)}</p>
        {text(content.author) && <cite>{text(content.author)}</cite>}
      </blockquote>
    );
  if (element.type === "spacer")
    return (
      <div
        aria-hidden="true"
        style={{
          height: Math.min(200, Math.max(8, number(content.height, 40))),
        }}
      />
    );
  if (element.type === "divider")
    return <hr className="built-divider" style={style} />;
  if (element.type === "hero")
    return (
      <div className="built-hero" style={alignedGridStyle}>
        <span>{text(content.eyebrow, "GTChat")}</span>
        <h1>{text(content.title, "Transforme cada conversa")}</h1>
        <p>{text(content.text)}</p>
        <Link className="built-button" href={safeUrl(content.buttonUrl)}>
          {text(content.buttonLabel, "Saiba mais")} <ArrowRight size={17} />
        </Link>
      </div>
    );
  if (element.type === "posts") {
    const count = Math.min(6, Math.max(1, number(content.count, 3)));
    const category = text(content.category);
    const visible = posts
      .filter((post) => !category || post.category_slug === category)
      .slice(0, count);
    return (
      <div className="built-posts" style={style}>
        <h2>{text(content.title, "Conteúdos recentes")}</h2>
        <div
          className={`post-grid post-grid-columns-${Math.min(3, Math.max(1, number(content.columns, 3)))}`}
        >
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    );
  }
  if (element.type === "categories") {
    const count = Math.min(8, Math.max(1, number(content.count, 4)));
    return (
      <div className="built-categories" style={style}>
        <h2>{text(content.title, "Explore por assunto")}</h2>
        <div>
          {categories.slice(0, count).map((category) => (
            <Link
              href={`/artigos?categoria=${category.slug}`}
              key={category.id}
            >
              <span style={{ background: category.color }} />
              <strong>{category.name}</strong>
              <small>{category.total} artigos</small>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  if (element.type === "features")
    return (
      <div className="built-features" style={style}>
        <h2>{text(content.title, "Benefícios")}</h2>
        <div>
          {list(content.items).map((item, index) => {
            const pair = parsePairedItem(item);
            return (
              <article key={`${pair.title}-${index}`}>
                <Check />
                <strong>{pair.title}</strong>
                {pair.description && <p>{pair.description}</p>}
              </article>
            );
          })}
        </div>
      </div>
    );
  if (element.type === "stats")
    return (
      <div className="built-stats" style={style}>
        {list(content.items).map((item) => {
          const [value, label] = item.split("|");
          return (
            <div key={item}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    );
  if (element.type === "testimonials")
    return (
      <div className="built-testimonial" style={style}>
        <h2>{text(content.title, "Quem usa recomenda")}</h2>
        <blockquote>“{text(content.quote)}”</blockquote>
        <strong>{text(content.author)}</strong>
      </div>
    );
  if (element.type === "faq")
    return (
      <div className="built-faq" style={style}>
        <h2>{text(content.title, "Perguntas frequentes")}</h2>
        {list(content.items).map((item, index) => {
          const [question, answer] = item.split("|");
          return (
            <details key={`${question}-${index}`}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          );
        })}
      </div>
    );
  if (element.type === "newsletter")
    return (
      <div className="built-newsletter" style={style}>
        <NewsletterSignup
          content={{
            title: text(content.title),
            description: text(content.description),
            buttonLabel: text(content.buttonLabel),
            consentText: text(content.consentText),
          }}
        />
      </div>
    );
  if (element.type === "cta")
    return (
      <div className="built-cta" style={alignedGridStyle}>
        <h2>{text(content.title)}</h2>
        <p>{text(content.text)}</p>
        <Link className="built-button" href={safeUrl(content.buttonUrl)}>
          {text(content.buttonLabel, "Saiba mais")}
        </Link>
      </div>
    );
  return null;
}
