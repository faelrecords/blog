"use client";

import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  ChevronLeft,
  Copy,
  History,
  Layers3,
  Monitor,
  Plus,
  Redo2,
  Save,
  Search,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageRenderer } from "@/components/page-renderer";
import type { PublicPost } from "@/lib/db";
import {
  createElement,
  createSection,
  ELEMENT_LIBRARY,
  SECTION_TEMPLATES,
  uid,
  type BuilderDocument,
  type BuilderElement,
  type BuilderElementType,
  type BuilderSection,
} from "@/lib/page-builder";

type PageInfo = {
  id: number;
  title: string;
  slug: string;
  status: string;
  is_home: number;
  seo_title: string;
  seo_description: string;
};
type PageCategory = {
  id: number;
  name: string;
  slug: string;
  color: string;
  total: number;
};
type ReusableSection = {
  id: number;
  name: string;
  section_json: string;
  updated_at: string;
};
type Selection = {
  sectionId: string;
  columnId?: string;
  elementId?: string;
} | null;
type Field = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "url" | "number" | "list" | "select";
  options?: { label: string; value: string | number }[];
};

const fields: Partial<Record<BuilderElementType, Field[]>> = {
  heading: [
    { key: "text", label: "Texto", kind: "textarea" },
    {
      key: "level",
      label: "Nível",
      kind: "select",
      options: [1, 2, 3, 4].map((value) => ({ label: `H${value}`, value })),
    },
  ],
  text: [{ key: "text", label: "Texto", kind: "textarea" }],
  button: [
    { key: "label", label: "Texto do botão" },
    { key: "url", label: "Link", kind: "url" },
  ],
  image: [
    { key: "url", label: "Imagem", kind: "url" },
    { key: "alt", label: "Texto alternativo" },
  ],
  video: [
    { key: "url", label: "URL incorporável", kind: "url" },
    { key: "title", label: "Título acessível" },
  ],
  quote: [
    { key: "text", label: "Citação", kind: "textarea" },
    { key: "author", label: "Autor" },
  ],
  spacer: [{ key: "height", label: "Altura", kind: "number" }],
  hero: [
    { key: "eyebrow", label: "Texto superior" },
    { key: "title", label: "Título", kind: "textarea" },
    { key: "text", label: "Descrição", kind: "textarea" },
    { key: "buttonLabel", label: "Botão" },
    { key: "buttonUrl", label: "Link", kind: "url" },
  ],
  posts: [
    { key: "title", label: "Título" },
    { key: "count", label: "Quantidade", kind: "number" },
    {
      key: "columns",
      label: "Colunas",
      kind: "select",
      options: [1, 2, 3].map((value) => ({ label: String(value), value })),
    },
    { key: "category", label: "Categoria", kind: "select" },
  ],
  categories: [
    { key: "title", label: "Título" },
    { key: "count", label: "Quantidade", kind: "number" },
  ],
  features: [
    { key: "title", label: "Título" },
    { key: "items", label: "Benefícios (um por linha)", kind: "list" },
  ],
  stats: [{ key: "items", label: "Indicadores (valor|legenda)", kind: "list" }],
  testimonials: [
    { key: "title", label: "Título" },
    { key: "quote", label: "Depoimento", kind: "textarea" },
    { key: "author", label: "Autor" },
  ],
  faq: [
    { key: "title", label: "Título" },
    { key: "items", label: "Perguntas (pergunta|resposta)", kind: "list" },
  ],
  cta: [
    { key: "title", label: "Título" },
    { key: "text", label: "Texto", kind: "textarea" },
    { key: "buttonLabel", label: "Botão" },
    { key: "buttonUrl", label: "Link", kind: "url" },
  ],
};

export function PageBuilderEditor({
  page: initialPage,
  initialDocument,
  posts,
  categories,
  initialReusable = [],
}: {
  page: PageInfo;
  initialDocument: BuilderDocument;
  posts: PublicPost[];
  categories: PageCategory[];
  initialReusable?: ReusableSection[];
}) {
  const [page, setPage] = useState(initialPage);
  const [document, setDocument] = useState(initialDocument);
  const [history, setHistory] = useState([initialDocument]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selection, setSelection] = useState<Selection>(() =>
    firstSelection(initialDocument),
  );
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [leftTab, setLeftTab] = useState<"elements" | "templates" | "outline">(
    "elements",
  );
  const [rightTab, setRightTab] = useState<
    "content" | "style" | "advanced" | "page" | "history"
  >("content");
  const [query, setQuery] = useState("");
  const [saveState, setSaveState] = useState("Tudo salvo");
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<
    { id: number; label: string; created_at: string; author_name: string }[]
  >([]);
  const savedSnapshot = useRef(
    JSON.stringify({ page: initialPage, document: initialDocument }),
  );
  const firstAutosave = useRef(true);
  const [reusable, setReusable] = useState(initialReusable);
  const selectedSection = selection
    ? document.sections.find((item) => item.id === selection.sectionId)
    : undefined;
  const selectedColumn = selectedSection?.columns.find(
    (item) => item.id === selection?.columnId,
  );
  const selectedElement = selectedColumn?.elements.find(
    (item) => item.id === selection?.elementId,
  );
  const dirty = JSON.stringify({ page, document }) !== savedSnapshot.current;

  function apply(next: BuilderDocument, nextSelection = selection) {
    const stack = [...history.slice(0, historyIndex + 1), next].slice(-60);
    setDocument(next);
    setHistory(stack);
    setHistoryIndex(stack.length - 1);
    setSelection(nextSelection);
    setSaveState("Alterações pendentes");
  }
  function mutate(
    callback: (draft: BuilderDocument) => void,
    nextSelection = selection,
  ) {
    const next = structuredClone(document);
    callback(next);
    apply(next, nextSelection);
  }
  function undo() {
    if (historyIndex < 1) return;
    setHistoryIndex(historyIndex - 1);
    setDocument(history[historyIndex - 1]);
    setSaveState("Alterações pendentes");
  }
  function redo() {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    setDocument(history[historyIndex + 1]);
    setSaveState("Alterações pendentes");
  }
  function addElement(type: BuilderElementType) {
    const element = createElement(type);
    if (selectedColumn)
      mutate(
        (draft) => {
          draft.sections
            .find((item) => item.id === selectedSection!.id)!
            .columns.find((item) => item.id === selectedColumn.id)!
            .elements.push(element);
        },
        {
          sectionId: selectedSection!.id,
          columnId: selectedColumn.id,
          elementId: element.id,
        },
      );
    else {
      const section = createSection(element);
      apply(
        { ...document, sections: [...document.sections, section] },
        {
          sectionId: section.id,
          columnId: section.columns[0].id,
          elementId: element.id,
        },
      );
    }
    setRightTab("content");
  }
  function addLayout(columns: number) {
    const section = createSection(createElement("heading"), columns);
    section.columns[0].elements = [];
    apply(
      { ...document, sections: [...document.sections, section] },
      { sectionId: section.id, columnId: section.columns[0].id },
    );
    setLeftTab("elements");
  }
  function addTemplate(id: string) {
    const template = SECTION_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    const section = template.create();
    apply(
      { ...document, sections: [...document.sections, section] },
      {
        sectionId: section.id,
        columnId: section.columns[0].id,
        elementId: section.columns[0].elements[0]?.id,
      },
    );
  }
  function addReusable(item: ReusableSection) {
    const section = JSON.parse(item.section_json) as BuilderSection;
    section.id = uid("section");
    section.columns.forEach((column) => {
      column.id = uid("column");
      column.elements.forEach((element) => {
        element.id = uid(element.type);
      });
    });
    apply(
      { ...document, sections: [...document.sections, section] },
      {
        sectionId: section.id,
        columnId: section.columns[0].id,
        elementId: section.columns[0].elements[0]?.id,
      },
    );
  }
  async function saveReusable(section: BuilderSection) {
    const name = prompt("Nome do modelo reutilizável:");
    if (!name) return;
    const response = await fetch("/api/admin/reusable-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, section }),
    });
    const data = await response.json();
    if (response.ok) {
      setReusable((current) => [...current, data]);
      setSaveState("Modelo reutilizável criado");
    } else setSaveState(data.error || "Falha ao criar modelo");
  }
  async function deleteReusable(item: ReusableSection) {
    if (!confirm(`Excluir o modelo “${item.name}”?`)) return;
    const response = await fetch(`/api/admin/reusable-sections/${item.id}`, {
      method: "DELETE",
    });
    if (response.ok)
      setReusable((current) => current.filter((entry) => entry.id !== item.id));
  }
  function updateElement(
    kind: "content" | "style" | "responsive",
    key: string,
    value: unknown,
  ) {
    if (!selectedElement || !selectedColumn || !selectedSection) return;
    mutate((draft) => {
      const element = draft.sections
        .find((item) => item.id === selectedSection.id)!
        .columns.find((item) => item.id === selectedColumn.id)!
        .elements.find((item) => item.id === selectedElement.id)!;
      if (kind === "content") element.content[key] = value;
      else if (kind === "style")
        (element.style as Record<string, unknown>)[key] = value;
      else {
        element.responsive ||= {};
        const target = key.split(".")[0] as "desktop" | "tablet" | "mobile";
        const property = key.split(".")[1];
        element.responsive[target] ||= {};
        (element.responsive[target] as Record<string, unknown>)[property] =
          value;
      }
    });
  }
  function updateSection(key: string, value: unknown) {
    if (!selectedSection) return;
    mutate((draft) => {
      const section = draft.sections.find(
        (item) => item.id === selectedSection.id,
      )!;
      if (key === "layout") section.layout = value as "boxed" | "full";
      else (section.style as Record<string, unknown>)[key] = value;
    });
  }
  function moveSection(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= document.sections.length) return;
    mutate((draft) => {
      [draft.sections[index], draft.sections[target]] = [
        draft.sections[target],
        draft.sections[index],
      ];
    });
  }
  function removeSelection() {
    if (!selection || !confirm("Excluir o item selecionado?")) return;
    mutate((draft) => {
      const sectionIndex = draft.sections.findIndex(
        (item) => item.id === selection.sectionId,
      );
      if (selection.elementId && selection.columnId) {
        const column = draft.sections[sectionIndex].columns.find(
          (item) => item.id === selection.columnId,
        )!;
        column.elements = column.elements.filter(
          (item) => item.id !== selection.elementId,
        );
      } else draft.sections.splice(sectionIndex, 1);
    }, null);
  }
  function duplicateSection(section: BuilderSection) {
    const copy = structuredClone(section);
    copy.id = uid("section");
    copy.columns.forEach((column) => {
      column.id = uid("column");
      column.elements.forEach((element) => {
        element.id = uid(element.type);
      });
    });
    apply(
      { ...document, sections: [...document.sections, copy] },
      {
        sectionId: copy.id,
        columnId: copy.columns[0].id,
        elementId: copy.columns[0].elements[0]?.id,
      },
    );
  }

  async function save(mode: "autosave" | "save" | "publish" | "archive") {
    if (busy && mode !== "autosave") return;
    if (mode !== "autosave") setBusy(true);
    setSaveState(mode === "publish" ? "Publicando..." : "Salvando...");
    const response = await fetch(`/api/admin/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...page, document, mode }),
    });
    const data = await response.json();
    if (response.ok) {
      const nextPage = { ...page, slug: data.slug, status: data.status };
      setPage(nextPage);
      setSaveState(mode === "publish" ? "Página publicada" : "Tudo salvo");
      if (mode !== "autosave")
        savedSnapshot.current = JSON.stringify({ page: nextPage, document });
    } else setSaveState(data.error || "Erro ao salvar");
    setBusy(false);
  }
  useEffect(() => {
    if (firstAutosave.current) {
      firstAutosave.current = false;
      return;
    }
    const timer = setTimeout(() => save("autosave"), 1800);
    return () => clearTimeout(timer);
  }, [document, page.title, page.slug, page.seo_title, page.seo_description]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function loadVersions() {
    setRightTab("history");
    const response = await fetch(`/api/admin/pages/${page.id}/versions`);
    if (response.ok) setVersions((await response.json()).versions);
  }
  async function restore(versionId: number) {
    if (!confirm("Restaurar esta versão no rascunho?")) return;
    const response = await fetch(
      `/api/admin/pages/${page.id}/versions/${versionId}`,
      { method: "POST" },
    );
    if (response.ok) {
      const data = await response.json();
      apply(data.document, firstSelection(data.document));
      setSaveState("Versão restaurada");
    }
  }
  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/media", { method: "POST", body });
    const data = await response.json();
    if (response.ok) updateElement("content", "url", data.url);
    else setSaveState(data.error || "Falha no upload");
  }

  const filteredElements = useMemo(
    () =>
      ELEMENT_LIBRARY.filter((item) =>
        `${item.label} ${item.category}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <div className="page-builder-editor">
      <header className="page-builder-toolbar">
        <a
          className="builder-back"
          href="/admin/paginas"
          aria-label="Voltar para páginas"
        >
          <ChevronLeft />
        </a>
        <div className="builder-page-name">
          <input
            aria-label="Título da página"
            value={page.title}
            onChange={(event) =>
              setPage((current) => ({ ...current, title: event.target.value }))
            }
          />
          <small>{saveState}</small>
        </div>
        <div className="device-switch">
          {(["desktop", "tablet", "mobile"] as const).map((item) => (
            <button
              className={device === item ? "active" : ""}
              key={item}
              onClick={() => setDevice(item)}
              aria-label={item}
            >
              {item === "desktop" ? (
                <Monitor />
              ) : item === "tablet" ? (
                <Tablet />
              ) : (
                <Smartphone />
              )}
            </button>
          ))}
        </div>
        <div className="builder-history-actions">
          <button onClick={undo} disabled={historyIndex < 1} title="Desfazer">
            <Undo2 />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Refazer"
          >
            <Redo2 />
          </button>
          <button onClick={loadVersions} title="Histórico">
            <History />
          </button>
          <button
            onClick={() => selectedSection && saveReusable(selectedSection)}
            disabled={!selectedSection}
            title="Salvar seção como modelo"
          >
            <BookmarkPlus />
          </button>
        </div>
        <div className="builder-publish-actions">
          <button
            className="btn btn-outline"
            onClick={() => save("save")}
            disabled={busy}
          >
            <Save size={17} /> Salvar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => save("publish")}
            disabled={busy}
          >
            {page.status === "publicado" ? "Atualizar" : "Publicar"}
          </button>
        </div>
      </header>
      <div className="page-builder-workspace">
        <aside className="page-builder-left">
          <div className="builder-panel-tabs">
            <button
              className={leftTab === "elements" ? "active" : ""}
              onClick={() => setLeftTab("elements")}
            >
              Elementos
            </button>
            <button
              className={leftTab === "templates" ? "active" : ""}
              onClick={() => setLeftTab("templates")}
            >
              Modelos
            </button>
            <button
              className={leftTab === "outline" ? "active" : ""}
              onClick={() => setLeftTab("outline")}
            >
              Camadas
            </button>
          </div>
          {leftTab === "elements" && (
            <div className="builder-panel-scroll">
              <div className="builder-search">
                <Search size={16} />
                <input
                  placeholder="Buscar elemento"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="layout-picker">
                <strong>Estrutura</strong>
                <div>
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => addLayout(count)}
                      aria-label={`${count} coluna(s)`}
                    >
                      {Array.from({ length: count }, (_, index) => (
                        <span key={index} />
                      ))}
                    </button>
                  ))}
                </div>
              </div>
              <div className="element-library">
                {filteredElements.map((item) => (
                  <button key={item.type} onClick={() => addElement(item.type)}>
                    <Plus size={16} />
                    <strong>{item.label}</strong>
                    <small>{item.category}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
          {leftTab === "templates" && (
            <div className="builder-panel-scroll template-library">
              {SECTION_TEMPLATES.map((item) => (
                <button key={item.id} onClick={() => addTemplate(item.id)}>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                  <small>{item.description}</small>
                </button>
              ))}
              {reusable.length > 0 && <h3 className="reusable-title">Meus modelos</h3>}
              {reusable.map((item) => (
                <div className="reusable-template" key={`reusable-${item.id}`}>
                  <button onClick={() => addReusable(item)}>
                    <strong>{item.name}</strong>
                    <span>Reutilizável</span>
                    <small>Modelo salvo por sua equipe</small>
                  </button>
                  <button className="reusable-delete" onClick={() => deleteReusable(item)} aria-label={`Excluir modelo ${item.name}`}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          )}
          {leftTab === "outline" && (
            <div className="builder-panel-scroll page-outline">
              {document.sections.map((section, index) => (
                <div className="outline-section" key={section.id}>
                  <button
                    className={
                      selection?.sectionId === section.id &&
                      !selection.elementId
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setSelection({ sectionId: section.id });
                      setRightTab("style");
                    }}
                  >
                    <Layers3 size={16} />
                    <strong>Seção {index + 1}</strong>
                  </button>
                  <div className="outline-actions">
                    <button
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSection(index, 1)}
                      disabled={index === document.sections.length - 1}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button onClick={() => duplicateSection(section)} title="Duplicar seção">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => saveReusable(section)} title="Salvar como modelo">
                      <BookmarkPlus size={14} />
                    </button>
                  </div>
                  {section.columns.flatMap((column) =>
                    column.elements.map((element) => (
                      <button
                        className={`outline-element ${selection?.elementId === element.id ? "active" : ""}`}
                        key={element.id}
                        onClick={() => {
                          setSelection({
                            sectionId: section.id,
                            columnId: column.id,
                            elementId: element.id,
                          });
                          setRightTab("content");
                        }}
                      >
                        {ELEMENT_LIBRARY.find(
                          (item) => item.type === element.type,
                        )?.label || element.type}
                      </button>
                    )),
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
        <main
          className="page-builder-canvas"
          onClick={(event) => {
            const target = event.target as HTMLElement;
            const element = target.closest<HTMLElement>("[data-element]");
            const section = target.closest<HTMLElement>("[data-section]");
            const column = target.closest<HTMLElement>("[data-column]");
            if (section)
              setSelection({
                sectionId: section.dataset.section!,
                columnId: column?.dataset.column,
                elementId: element?.dataset.element,
              });
          }}
        >
          <div className={`page-builder-device device-${device}`}>
            <PageRenderer
              document={document}
              previewDevice={device}
              posts={posts}
              categories={categories}
              selectedSectionId={selection?.sectionId}
              selectedElementId={selection?.elementId}
            />
            {!document.sections.length && (
              <div className="builder-empty-canvas">
                <Layers3 />
                <h2>Comece sua página</h2>
                <p>
                  Adicione uma estrutura, elemento ou modelo pelo painel
                  esquerdo.
                </p>
              </div>
            )}
          </div>
        </main>
        <aside className="page-builder-right">
          <div className="builder-panel-tabs right-tabs">
            <button
              className={rightTab === "content" ? "active" : ""}
              onClick={() => setRightTab("content")}
            >
              Conteúdo
            </button>
            <button
              className={rightTab === "style" ? "active" : ""}
              onClick={() => setRightTab("style")}
            >
              Estilo
            </button>
            <button
              className={rightTab === "advanced" ? "active" : ""}
              onClick={() => setRightTab("advanced")}
            >
              Avançado
            </button>
            <button
              className={rightTab === "page" ? "active" : ""}
              onClick={() => setRightTab("page")}
            >
              <Settings2 size={15} />
            </button>
          </div>
          <div className="builder-panel-scroll">
            {rightTab === "page" ? (
              <PageSettings page={page} setPage={setPage} archive={() => save("archive")} />
            ) : rightTab === "history" ? (
              <VersionList versions={versions} restore={restore} />
            ) : selectedElement ? (
              <ElementInspector
                element={selectedElement}
                tab={rightTab}
                categories={categories}
                update={updateElement}
                upload={uploadImage}
              />
            ) : selectedSection ? (
              <SectionInspector
                section={selectedSection}
                update={updateSection}
              />
            ) : (
              <div className="builder-no-selection">
                <Settings2 />
                <p>Selecione uma seção ou elemento para editar.</p>
              </div>
            )}
            {selection && rightTab !== "page" && rightTab !== "history" && (
              <button
                className="btn btn-danger builder-delete"
                onClick={removeSelection}
              >
                <Trash2 size={16} /> Excluir selecionado
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function firstSelection(document: BuilderDocument): Selection {
  const section = document.sections[0];
  const column = section?.columns[0];
  const element = column?.elements[0];
  return section
    ? { sectionId: section.id, columnId: column?.id, elementId: element?.id }
    : null;
}
function PageSettings({
  page,
  setPage,
  archive,
}: {
  page: PageInfo;
  setPage: React.Dispatch<React.SetStateAction<PageInfo>>;
  archive: () => void;
}) {
  const field = (key: keyof PageInfo, label: string, textarea = false) => (
    <div className="field">
      <label>{label}</label>
      {textarea ? (
        <textarea
          className="textarea"
          value={String(page[key])}
          onChange={(event) =>
            setPage((current) => ({ ...current, [key]: event.target.value }))
          }
        />
      ) : (
        <input
          className="input"
          value={String(page[key])}
          onChange={(event) =>
            setPage((current) => ({ ...current, [key]: event.target.value }))
          }
        />
      )}
    </div>
  );
  return (
    <div className="inspector-fields">
      <h3>Configurações da página</h3>
      {field("title", "Título")}
      {!page.is_home && field("slug", "Endereço")}
      {field("seo_title", "Título SEO")}
      {field("seo_description", "Descrição SEO", true)}
      <p className="muted">
        Status atual: <strong>{page.status}</strong>
      </p>
      {!page.is_home && <button className="btn btn-danger" type="button" onClick={archive}>Arquivar página</button>}
    </div>
  );
}
function VersionList({
  versions,
  restore,
}: {
  versions: {
    id: number;
    label: string;
    created_at: string;
    author_name: string;
  }[];
  restore: (id: number) => void;
}) {
  return (
    <div className="inspector-fields">
      <h3>Histórico de versões</h3>
      {versions.length ? (
        versions.map((version) => (
          <button
            className="version-item"
            key={version.id}
            onClick={() => restore(version.id)}
          >
            <strong>{version.label}</strong>
            <span>{new Date(version.created_at).toLocaleString("pt-BR")}</span>
            <small>{version.author_name}</small>
          </button>
        ))
      ) : (
        <p className="muted">Salve ou publique para criar versões.</p>
      )}
    </div>
  );
}
function SectionInspector({
  section,
  update,
}: {
  section: BuilderSection;
  update: (key: string, value: unknown) => void;
}) {
  return (
    <div className="inspector-fields">
      <h3>Configurações da seção</h3>
      <div className="field">
        <label>Largura</label>
        <select
          className="select"
          value={section.layout}
          onChange={(event) => update("layout", event.target.value)}
        >
          <option value="boxed">Centralizada</option>
          <option value="full">Largura total</option>
        </select>
      </div>
      <StyleFields style={section.style} update={update} />
    </div>
  );
}
function ElementInspector({
  element,
  tab,
  categories,
  update,
  upload,
}: {
  element: BuilderElement;
  tab: "content" | "style" | "advanced";
  categories: PageCategory[];
  update: (
    kind: "content" | "style" | "responsive",
    key: string,
    value: unknown,
  ) => void;
  upload: (file: File) => void;
}) {
  if (tab === "style")
    return (
      <div className="inspector-fields">
        <h3>Estilo do elemento</h3>
        <StyleFields
          style={element.style}
          update={(key, value) => update("style", key, value)}
        />
      </div>
    );
  if (tab === "advanced")
    return (
      <div className="inspector-fields">
        <h3>Responsividade</h3>
        {(["desktop", "tablet", "mobile"] as const).map((device) => (
          <label className="visibility-option" key={device}>
            <span>
              {device === "desktop" ? (
                <Monitor />
              ) : device === "tablet" ? (
                <Tablet />
              ) : (
                <Smartphone />
              )}{" "}
              Ocultar em {device}
            </span>
            <input
              type="checkbox"
              checked={Boolean(element.responsive?.[device]?.hidden)}
              onChange={(event) =>
                update("responsive", `${device}.hidden`, event.target.checked)
              }
            />
          </label>
        ))}
      </div>
    );
  const elementFields = (fields[element.type] || []).map((field) =>
    field.key === "category"
      ? {
          ...field,
          options: [
            { label: "Todas", value: "" },
            ...categories.map((category) => ({
              label: category.name,
              value: category.slug,
            })),
          ],
        }
      : field,
  );
  return (
    <div className="inspector-fields">
      <h3>
        {ELEMENT_LIBRARY.find((item) => item.type === element.type)?.label}
      </h3>
      {elementFields.map((field) => (
        <ContentField
          key={field.key}
          field={field}
          value={element.content[field.key]}
          update={(value) => update("content", field.key, value)}
        />
      ))}
      {element.type === "image" && (
        <label className="btn btn-outline image-upload">
          <Upload size={16} /> Enviar imagem
          <input
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) =>
              event.target.files?.[0] && upload(event.target.files[0])
            }
          />
        </label>
      )}
    </div>
  );
}
function ContentField({
  field,
  value,
  update,
}: {
  field: Field;
  value: unknown;
  update: (value: unknown) => void;
}) {
  const current =
    field.kind === "list"
      ? Array.isArray(value)
        ? value.join("\n")
        : ""
      : String(value ?? "");
  return (
    <div className="field">
      <label>{field.label}</label>
      {field.kind === "textarea" || field.kind === "list" ? (
        <textarea
          className="textarea"
          rows={field.kind === "list" ? 6 : 4}
          value={current}
          onChange={(event) =>
            update(
              field.kind === "list"
                ? event.target.value.split("\n").filter(Boolean)
                : event.target.value,
            )
          }
        />
      ) : field.kind === "select" ? (
        <select
          className="select"
          value={current}
          onChange={(event) => {
            const option = field.options?.find(
              (item) => String(item.value) === event.target.value,
            );
            update(option?.value ?? event.target.value);
          }}
        >
          {field.options?.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          type={
            field.kind === "number"
              ? "number"
              : field.kind === "url"
                ? "url"
                : "text"
          }
          value={current}
          onChange={(event) =>
            update(
              field.kind === "number"
                ? Number(event.target.value)
                : event.target.value,
            )
          }
        />
      )}
    </div>
  );
}
function StyleFields({
  style,
  update,
}: {
  style: BuilderElement["style"];
  update: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="style-color-row">
        <div className="field">
          <label>Fundo</label>
          <input
            type="color"
            value={
              style.background && /^#[0-9a-f]{6}$/i.test(style.background)
                ? style.background
                : "#ffffff"
            }
            onChange={(event) => update("background", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Texto</label>
          <input
            type="color"
            value={
              style.color && /^#[0-9a-f]{6}$/i.test(style.color)
                ? style.color
                : "#0b1c30"
            }
            onChange={(event) => update("color", event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label>Alinhamento</label>
        <select
          className="select"
          value={style.align || "left"}
          onChange={(event) => update("align", event.target.value)}
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </div>
      {[
        ["padding", "Espaçamento interno"],
        ["margin", "Margem vertical"],
        ["radius", "Cantos arredondados"],
        ["fontSize", "Tamanho do texto"],
      ].map(([key, label]) => (
        <div className="field" key={key}>
          <label>{label}</label>
          <input
            className="input"
            type="number"
            min="0"
            max="160"
            value={String((style as Record<string, unknown>)[key] ?? "")}
            onChange={(event) =>
              update(
                key,
                event.target.value === ""
                  ? undefined
                  : Number(event.target.value),
              )
            }
          />
        </div>
      ))}
      <label className="visibility-option">
        <span>Sombra</span>
        <input
          type="checkbox"
          checked={Boolean(style.shadow)}
          onChange={(event) => update("shadow", event.target.checked)}
        />
      </label>
    </>
  );
}
