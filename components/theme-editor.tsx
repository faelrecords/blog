"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, Monitor, RotateCcw, Save, Smartphone, Tablet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_HOME_BLOCKS, DEFAULT_THEME_SETTINGS } from "@/lib/theme";

type Block = { id: string; type: string; title: string; enabled: boolean; position: number; config_json: string };
type InitialBlock = Omit<Block, "enabled"> & { enabled: number | boolean };
type Tab = "marca" | "cores" | "pagina" | "chamada";
type Device = "desktop" | "tablet" | "mobile";

const tabs: { id: Tab; label: string }[] = [
  { id: "marca", label: "Marca" },
  { id: "cores", label: "Cores e fontes" },
  { id: "pagina", label: "Página inicial" },
  { id: "chamada", label: "Chamada final" },
];
const editableThemeKeys = ["logo_text", "logo_url", "favicon_url", "primary_color", "accent_color", "background_color", "text_color", "heading_font", "body_font", "cta_title", "cta_text", "cta_label", "cta_url"] as const;

export function ThemeEditor({ initialSettings, initialBlocks }: { initialSettings: Record<string, string>; initialBlocks: InitialBlock[] }) {
  const router = useRouter();
  const normalizedInitialBlocks = initialBlocks.map((block) => ({ ...block, enabled: Boolean(block.enabled) }));
  const [settings, setSettings] = useState({ ...DEFAULT_THEME_SETTINGS, ...initialSettings });
  const [blocks, setBlocks] = useState(normalizedInitialBlocks);
  const [savedSettings, setSavedSettings] = useState({ ...DEFAULT_THEME_SETTINGS, ...initialSettings });
  const [savedBlocks, setSavedBlocks] = useState(normalizedInitialBlocks);
  const [tab, setTab] = useState<Tab>("marca");
  const [device, setDevice] = useState<Device>("desktop");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings) || JSON.stringify(blocks) !== JSON.stringify(savedBlocks), [settings, blocks, savedSettings, savedBlocks]);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const interceptLinks = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank" || !anchor.href || anchor.href === window.location.href) return;
      if (!window.confirm("Você tem alterações de aparência não publicadas. Deseja sair mesmo assim?")) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", interceptLinks, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", interceptLinks, true); };
  }, [dirty]);

  const set = (key: string, value: string) => { setSettings((current) => ({ ...current, [key]: value })); setMessage(""); };
  const updateBlocks = (next: Block[]) => { setBlocks(next.map((block, index) => ({ ...block, position: index }))); setMessage(""); };
  const move = (index: number, delta: number) => {
    const next = [...blocks]; const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateBlocks(next);
  };
  const toggle = (id: string) => updateBlocks(blocks.map((block) => block.id === id ? { ...block, enabled: !block.enabled } : block));

  async function upload(file: File, key: "logo_url" | "favicon_url") {
    const form = new FormData(); form.append("file", file);
    const response = await fetch("/api/media", { method: "POST", body: form });
    const data = await response.json();
    if (response.ok) set(key, data.url); else setMessage(data.error || "Não foi possível enviar a imagem.");
  }

  async function save() {
    setSaving(true); setMessage("Salvando alterações...");
    const response = await fetch("/api/admin/theme", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings, blocks }) });
    if (response.ok) {
      setSavedSettings({ ...settings }); setSavedBlocks(blocks.map((block) => ({ ...block })));
      setMessage("Tema publicado com sucesso."); router.refresh();
    } else setMessage("Não foi possível publicar as alterações.");
    setSaving(false);
  }

  function discard() { setSettings({ ...savedSettings }); setBlocks(savedBlocks.map((block) => ({ ...block }))); setMessage("Alterações descartadas."); }
  function restoreDefaults() {
    if (!window.confirm("Restaurar os valores padrão no formulário? Nada será publicado até você salvar.")) return;
    setSettings((current) => ({ ...current, ...Object.fromEntries(editableThemeKeys.map((key) => [key, DEFAULT_THEME_SETTINGS[key]])) }));
    setBlocks(DEFAULT_HOME_BLOCKS.map((block) => ({ ...block })));
    setMessage("Padrões carregados. Revise a prévia antes de publicar.");
  }

  const brandName = settings.logo_text || "GTChat";
  return <div className="theme-workspace">
    <section className="panel theme-controls">
      <div className="theme-tabs" role="tablist" aria-label="Configurações de aparência">{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>

      <div className="theme-tab-panel" role="tabpanel">
        {tab === "marca" && <div className="theme-form-section"><div><h2>Identidade da marca</h2><p className="muted">A logo será usada no cabeçalho, rodapé e prévia.</p></div><div className="field"><label>Nome da marca</label><input className="input" value={settings.logo_text} onChange={(event) => set("logo_text", event.target.value)}/></div><AssetField label="Logo do cabeçalho e rodapé" value={settings.logo_url} alt={brandName} accept="image/png,image/jpeg,image/webp" onUpload={(file) => upload(file, "logo_url")} onRemove={() => set("logo_url", "")}/><AssetField label="Favicon" value={settings.favicon_url} alt="Favicon" accept="image/png,image/jpeg,image/webp" compact onUpload={(file) => upload(file, "favicon_url")} onRemove={() => set("favicon_url", "")}/></div>}

        {tab === "cores" && <div className="theme-form-section"><div><h2>Cores e tipografia</h2><p className="muted">Escolha uma combinação legível e coerente com a marca.</p></div><div className="theme-color-grid">{[["Cor principal", "primary_color"], ["Cor de apoio", "accent_color"], ["Fundo", "background_color"], ["Texto", "text_color"]].map(([label, key]) => <div className="field" key={key}><label>{label}</label><div className="color-field"><input aria-label={`Selecionar ${label.toLowerCase()}`} type="color" value={settings[key]} onChange={(event) => set(key, event.target.value)}/><input className="input" value={settings[key]} onChange={(event) => set(key, event.target.value)}/></div></div>)}</div><div className="theme-font-grid"><div className="field"><label>Fonte dos títulos</label><select className="select" value={settings.heading_font} onChange={(event) => set("heading_font", event.target.value)}><option>Hanken Grotesk</option><option>Inter</option><option>Arial</option><option>Georgia</option></select></div><div className="field"><label>Fonte do corpo</label><select className="select" value={settings.body_font} onChange={(event) => set("body_font", event.target.value)}><option>Inter</option><option>Hanken Grotesk</option><option>Arial</option><option>Georgia</option></select></div></div></div>}

        {tab === "pagina" && <div className="theme-form-section"><div><h2>Blocos da página inicial</h2><p className="muted">Organize a ordem e escolha o que fica visível.</p></div><div className="theme-block-list">{blocks.map((block, index) => <div className={`block-row ${block.enabled ? "" : "disabled"}`} key={block.id}><button type="button" className="block-visibility" onClick={() => toggle(block.id)} aria-label={block.enabled ? `Ocultar ${block.title}` : `Exibir ${block.title}`}>{block.enabled ? <Eye/> : <EyeOff/>}</button><div><strong>{block.title}</strong><small>{block.enabled ? "Visível" : "Oculto"}</small></div><div className="block-move-actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover ${block.title} para cima`}><ChevronUp/> <span>Subir</span></button><button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label={`Mover ${block.title} para baixo`}><ChevronDown/> <span>Descer</span></button></div></div>)}</div></div>}

        {tab === "chamada" && <div className="theme-form-section"><div><h2>Chamada final</h2><p className="muted">Configure o convite exibido perto do final da página inicial.</p></div><div className="field"><label>Título</label><input className="input" value={settings.cta_title} onChange={(event) => set("cta_title", event.target.value)}/></div><div className="field"><label>Texto</label><textarea className="textarea" rows={4} value={settings.cta_text} onChange={(event) => set("cta_text", event.target.value)}/></div><div className="theme-font-grid"><div className="field"><label>Texto do botão</label><input className="input" value={settings.cta_label} onChange={(event) => set("cta_label", event.target.value)}/></div><div className="field"><label>Link do botão</label><input className="input" type="url" value={settings.cta_url} onChange={(event) => set("cta_url", event.target.value)}/></div></div></div>}
      </div>

      <div className="theme-action-bar"><div className="theme-save-state"><span className={dirty ? "dirty-dot" : "saved-dot"}/>{dirty ? "Alterações não publicadas" : "Tudo publicado"}</div><div className="theme-action-buttons"><button className="btn btn-ghost" type="button" onClick={restoreDefaults}><RotateCcw size={17}/> Restaurar padrão</button><button className="btn btn-outline" type="button" disabled={!dirty || saving} onClick={discard}>Descartar</button><button className="btn btn-primary" type="button" disabled={!dirty || saving} onClick={save}><Save size={17}/>{saving ? "Publicando..." : "Publicar alterações"}</button></div></div>
      {message && <p className={message.includes("sucesso") ? "form-success" : "theme-message"}>{message}</p>}
    </section>

    <details className="preview-details" open><summary>Prévia do blog</summary><aside className="preview-frame"><div className="preview-toolbar"><strong>Prévia</strong><div className="device-switch" aria-label="Tamanho da prévia">{(["desktop", "tablet", "mobile"] as Device[]).map((item) => <button type="button" key={item} className={device === item ? "active" : ""} onClick={() => setDevice(item)} aria-label={`Prévia em ${item}`}>{item === "desktop" ? <Monitor/> : item === "tablet" ? <Tablet/> : <Smartphone/>}</button>)}</div></div><ThemePreview settings={settings} blocks={blocks} device={device}/></aside></details>
  </div>;
}

function AssetField({ label, value, alt, accept, compact, onUpload, onRemove }: { label: string; value: string; alt: string; accept: string; compact?: boolean; onUpload: (file: File) => void; onRemove: () => void }) {
  return <div className="field"><label>{label}</label><div className={`asset-field ${compact ? "compact" : ""}`}>{value ? <img src={value} alt={alt}/> : <div className="asset-placeholder">Nenhuma imagem definida</div>}<div className="actions"><label className="btn btn-outline">{value ? "Substituir" : "Enviar imagem"}<input hidden type="file" accept={accept} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])}/></label>{value && <button className="btn btn-ghost" type="button" onClick={onRemove}>Remover</button>}</div></div></div>;
}

function ThemePreview({ settings, blocks, device }: { settings: Record<string, string>; blocks: Block[]; device: Device }) {
  const style = { "--preview-primary": settings.primary_color, "--preview-accent": settings.accent_color, "--preview-bg": settings.background_color, "--preview-text": settings.text_color, "--preview-heading": settings.heading_font, "--preview-body": settings.body_font } as React.CSSProperties;
  const brand = settings.logo_text || "GTChat";
  return <div className={`preview-stage device-${device}`} data-device={device}><div className="preview-surface" style={style}><header className="preview-site-header"><div className="preview-brand">{settings.logo_url ? <img src={settings.logo_url} alt={brand}/> : <span>GT</span>}<strong>{brand}</strong></div><nav className="preview-site-nav">Início&nbsp;&nbsp; Artigos&nbsp;&nbsp; Sobre</nav><span className="preview-menu-icon">☰</span></header><main className="preview-site-main">{blocks.filter((block) => block.enabled).map((block) => {
    if (block.type === "hero") return <section className="preview-hero" key={block.id}><div><small>IA E BOTS</small><h1>Como agentes de IA transformam o atendimento</h1><p>Uma experiência editorial clara, moderna e conectada à sua marca.</p><button>Ler artigo</button></div><div className="preview-hero-art"/></section>;
    if (block.type === "latest") return <section className="preview-section" key={block.id}><h2>Conteúdos recentes</h2><div className="preview-card-grid">{[1, 2, 3].map((item) => <article key={item}><div/><strong>Estratégias para atender melhor</strong><small>5 min de leitura</small></article>)}</div></section>;
    if (block.type === "categories") return <section className="preview-section" key={block.id}><h2>Explore por assunto</h2><div className="preview-category-row">{["WhatsApp", "IA e Bots", "Produto"].map((item) => <span key={item}>{item}</span>)}</div></section>;
    return <section className="preview-cta" key={block.id}><h2>{settings.cta_title}</h2><p>{settings.cta_text}</p><button>{settings.cta_label}</button></section>;
  })}</main><footer className="preview-site-footer"><div className="preview-brand">{settings.logo_url ? <img src={settings.logo_url} alt={brand}/> : <span>GT</span>}<strong>{brand}</strong></div><small>{settings.footer_text}</small></footer></div></div>;
}
