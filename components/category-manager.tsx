"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export type CategoryItem = { id: number; name: string; slug: string; color: string; count?: number };

export function CategoryManager({ categories: initialCategories, compact = false }: { categories: CategoryItem[]; compact?: boolean }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#106e00");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color }) });
    const data = await response.json();
    if (response.ok) {
      setCategories((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      setName(""); setMessage("Categoria criada."); router.refresh();
    } else setMessage(data.error || "Não foi possível criar a categoria.");
    setBusy(false);
  }

  async function remove(category: CategoryItem) {
    const suffix = category.count ? ` ${category.count} artigo(s) ficarão sem categoria.` : "";
    if (!window.confirm(`Excluir a categoria “${category.name}”?${suffix}`)) return;
    setBusy(true); setMessage("");
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const data = await response.json();
    if (response.ok) {
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setMessage("Categoria excluída."); router.refresh();
    } else setMessage(data.error || "Não foi possível excluir a categoria.");
    setBusy(false);
  }

  return <section className={compact ? "category-manager compact" : "panel category-manager"}>
    <div className="category-manager-head"><div><h2>Categorias</h2><p className="muted">Crie a organização usada nos artigos.</p></div></div>
    <form className="category-create" onSubmit={create}>
      <div className="field"><label htmlFor={compact ? "category-name-compact" : "category-name"}>Nome</label><input id={compact ? "category-name-compact" : "category-name"} className="input" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required /></div>
      <div className="field category-color"><label htmlFor={compact ? "category-color-compact" : "category-color"}>Cor</label><input id={compact ? "category-color-compact" : "category-color"} type="color" value={color} onChange={(event) => setColor(event.target.value)} /></div>
      <button className="btn btn-primary" disabled={busy || name.trim().length < 2}><Plus size={17}/> Criar</button>
    </form>
    <div className="category-list">{categories.length ? categories.map((category) => <div className="category-item" key={category.id}><span className="category-dot" style={{ background: category.color }}/><div><strong>{category.name}</strong><small>{category.count || 0} artigo(s)</small></div><button type="button" className="icon-danger" onClick={() => remove(category)} disabled={busy} aria-label={`Excluir categoria ${category.name}`}><Trash2 size={17}/></button></div>) : <p className="muted">Nenhuma categoria criada.</p>}</div>
    {message && <p className="category-message" aria-live="polite">{message}</p>}
  </section>;
}
