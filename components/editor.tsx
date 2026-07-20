"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

type PostData = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content_json: string;
  content_html: string;
  cover_image: string;
  cover_alt: string;
  category_id: number | null;
  tags_text: string;
  seo_title: string;
  seo_description: string;
  status: string;
  scheduled_at: string | null;
  review_note?: string;
};

export function PostEditor({ initial, categories, canPublish }: { initial: PostData; categories: { id: number; name: string }[]; canPublish: boolean }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [saved, setSaved] = useState("Tudo salvo");
  const [busy, setBusy] = useState(false);
  const first = useRef(true);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), Image, Placeholder.configure({ placeholder: "Comece a escrever seu artigo..." })],
    content: initial.content_html || "<p></p>",
    onUpdate: () => setSaved("Alterações pendentes"),
  });

  const update = (key: keyof PostData, value: unknown) => {
    setPost((current) => ({ ...current, [key]: value }));
    setSaved("Alterações pendentes");
  };

  const save = useCallback(async (silent = false) => {
    if (!editor || (!post.title && !post.id)) return;
    setBusy(true);
    if (!silent) setSaved("Salvando...");
    const payload = { ...post, content_html: editor.getHTML(), content_json: JSON.stringify(editor.getJSON()) };
    const response = await fetch(post.id ? `/api/posts/${post.id}` : "/api/posts", {
      method: post.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      setPost((current) => ({ ...current, id: data.id, slug: data.slug }));
      setSaved("Tudo salvo");
      if (!post.id) router.replace(`/publicar/${data.id}`);
    } else {
      setSaved(data.error || "Erro ao salvar");
    }
    setBusy(false);
  }, [editor, post, router]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timeout = setTimeout(() => save(true), 1800);
    return () => clearTimeout(timeout);
  }, [post.title, post.slug, post.excerpt, post.cover_image, post.cover_alt, post.category_id, post.tags_text, post.seo_title, post.seo_description, editor?.getHTML(), save]);

  const action = async (name: string) => {
    if (!post.id) {
      await save();
      return;
    }
    setBusy(true);
    const body = name === "approve" ? { scheduled_at: post.scheduled_at } : {};
    const response = await fetch(`/api/posts/${post.id}/${name}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) {
      router.refresh();
      location.href = canPublish ? "/admin/artigos" : "/publicar";
    } else {
      const data = await response.json();
      alert(data.error || "Não foi possível concluir");
    }
    setBusy(false);
  };

  const upload = async (file: File, cover = false) => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/media", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) return alert(data.error);
    if (cover) update("cover_image", data.url);
    else editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
  };

  const tool = (label: string, run: () => void, active = false) => <button type="button" className={`tool ${active ? "active" : ""}`} onClick={run}>{label}</button>;
  const primaryAction = () => canPublish
    ? <button className="btn btn-primary" disabled={!post.id || busy} onClick={() => action("approve")}>{post.scheduled_at ? "Agendar" : "Publicar agora"}</button>
    : <button className="btn btn-primary" disabled={!post.id || busy} onClick={() => action("submit")}>Enviar para revisão</button>;

  return <div className="editor-layout">
    <section className="editor-main">
      {post.review_note && <p className="form-error"><strong>Alterações solicitadas:</strong> {post.review_note}</p>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="status">{post.status.replaceAll("_", " ")}</span><span className="autosave">{saved}</span></div>
      <div className="mobile-editor-actions"><button className="btn btn-outline" disabled={busy} onClick={() => save()}>Salvar</button>{primaryAction()}</div>
      <input className="title-input" value={post.title} onChange={(event) => update("title", event.target.value)} placeholder="Título do artigo" />
      <div className="editor-box">
        <div className="toolbar">
          {tool("B", () => editor?.chain().focus().toggleBold().run(), editor?.isActive("bold"))}
          {tool("I", () => editor?.chain().focus().toggleItalic().run(), editor?.isActive("italic"))}
          {tool("U", () => editor?.chain().focus().toggleUnderline().run(), editor?.isActive("underline"))}
          {tool("H2", () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), editor?.isActive("heading", { level: 2 }))}
          {tool("H3", () => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
          {tool("Lista", () => editor?.chain().focus().toggleBulletList().run())}
          {tool("1.", () => editor?.chain().focus().toggleOrderedList().run())}
          {tool("Citação", () => editor?.chain().focus().toggleBlockquote().run())}
          {tool("Link", () => { const href = prompt("URL do link:"); if (href) editor?.chain().focus().setLink({ href }).run(); })}
          <label className="tool">Imagem<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} /></label>
          {tool("↶", () => editor?.chain().focus().undo().run())}
          {tool("↷", () => editor?.chain().focus().redo().run())}
        </div>
        <EditorContent editor={editor} className="tiptap-content prose" />
      </div>
    </section>
    <aside className="editor-aside"><div className="stack">
      <div className="editor-primary-actions stack"><button className="btn btn-outline" disabled={busy} onClick={() => save()}>Salvar rascunho</button>{primaryAction()}</div>
      <div className="field"><label>Resumo</label><textarea className="textarea" rows={4} value={post.excerpt} onChange={(event) => update("excerpt", event.target.value)} /></div>
      <div className="field"><label>Slug</label><input className="input" value={post.slug} onChange={(event) => update("slug", event.target.value)} /></div>
      <div className="field"><label>Categoria</label><select className="select" value={post.category_id || ""} onChange={(event) => update("category_id", Number(event.target.value) || null)}><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      <div className="field"><label>Imagem de capa</label>{post.cover_image && <img src={post.cover_image} alt="Prévia da capa" style={{ borderRadius: 10, maxHeight: 150, objectFit: "cover", width: "100%" }} />}<label className="btn btn-outline">Enviar imagem<input type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], true)} /></label><input className="input" placeholder="Texto alternativo" value={post.cover_alt} onChange={(event) => update("cover_alt", event.target.value)} /></div>
      <div className="field"><label>Tags separadas por vírgula</label><input className="input" value={post.tags_text} onChange={(event) => update("tags_text", event.target.value)} /></div>
      {canPublish && <div className="field"><label>Agendar publicação</label><input className="input" type="datetime-local" value={post.scheduled_at?.slice(0, 16) || ""} onChange={(event) => update("scheduled_at", event.target.value || null)} /></div>}
      <details><summary>SEO</summary><div className="field"><label>Título SEO</label><input className="input" value={post.seo_title} onChange={(event) => update("seo_title", event.target.value)} /></div><div className="field"><label>Descrição SEO</label><textarea className="textarea" value={post.seo_description} onChange={(event) => update("seo_description", event.target.value)} /></div></details>
    </div></aside>
  </div>;
}
