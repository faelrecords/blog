"use client";

import { FormEvent, useState } from "react";
import { Download, Save, Search, Trash2 } from "lucide-react";
import type { Subscriber } from "@/lib/newsletter-db";

type Stats = {
  active: number | null;
  inactive: number | null;
  recent: number | null;
};
type ListResult = {
  items: Subscriber[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  stats: Stats;
};

export function SubscriberManager({
  initial,
  initialStats,
  initialSettings,
}: {
  initial: Omit<ListResult, "stats">;
  initialStats: Stats;
  initialSettings: Record<string, string>;
}) {
  const [result, setResult] = useState<ListResult>({
    ...initial,
    stats: initialStats,
  });
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    period: "all",
  });
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(initialSettings);

  async function load(page = 1, nextFilters = filters) {
    const params = new URLSearchParams({
      ...nextFilters,
      page: String(page),
    });
    const response = await fetch(`/api/admin/subscribers?${params}`);
    if (response.ok) setResult(await response.json());
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    await load(1);
  }

  function updateLocal(
    id: number,
    key: "name" | "email" | "status",
    value: string,
  ) {
    setResult((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? ({ ...item, [key]: value } as Subscriber) : item,
      ),
    }));
  }

  async function saveSubscriber(item: Subscriber) {
    setMessage("Salvando inscrito...");
    const response = await fetch(`/api/admin/subscribers/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: item.name,
        email: item.email,
        status: item.status,
      }),
    });
    const data = await response.json();
    setMessage(
      response.ok
        ? "Inscrito atualizado."
        : data.error || "Falha ao atualizar.",
    );
    if (response.ok) await load(result.page);
  }

  async function removeSubscriber(item: Subscriber) {
    if (!confirm(`Excluir definitivamente ${item.email}?`)) return;
    const response = await fetch(`/api/admin/subscribers/${item.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setMessage("Inscrito excluído definitivamente.");
      await load(result.page);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Salvando configurações...");
    const response = await fetch("/api/admin/newsletter-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (response.ok) {
      setSettings(data.settings);
      setMessage("Configurações da lista atualizadas.");
    } else setMessage(data.error || "Falha ao salvar configurações.");
  }

  return (
    <div className="subscriber-admin stack">
      <div className="stat-grid subscriber-stats">
        <div className="stat">
          Ativos<strong>{result.stats.active || 0}</strong>
        </div>
        <div className="stat">
          Inativos<strong>{result.stats.inactive || 0}</strong>
        </div>
        <div className="stat">
          Últimos 30 dias<strong>{result.stats.recent || 0}</strong>
        </div>
        <div className="stat">
          Encontrados<strong>{result.total}</strong>
        </div>
      </div>

      <section className="panel subscriber-list-panel">
        <div className="subscriber-list-head">
          <div>
            <h2>Lista de inscritos</h2>
            <p className="muted">
              Edite, desative ou exclua contatos cadastrados.
            </p>
          </div>
          <a className="btn btn-primary" href="/api/admin/subscribers/export">
            <Download size={17} /> Exportar ativos em CSV
          </a>
        </div>
        <form className="subscriber-filters" onSubmit={search}>
          <label className="builder-search">
            <Search size={16} />
            <input
              aria-label="Buscar inscritos"
              placeholder="Nome ou e-mail"
              value={filters.query}
              onChange={(event) =>
                setFilters({ ...filters, query: event.target.value })
              }
            />
          </label>
          <select
            className="select"
            aria-label="Filtrar por status"
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value })
            }
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <select
            className="select"
            aria-label="Filtrar por período"
            value={filters.period}
            onChange={(event) =>
              setFilters({ ...filters, period: event.target.value })
            }
          >
            <option value="all">Todo o período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          <button className="btn btn-outline">Filtrar</button>
        </form>

        <div className="table-wrap">
          <table className="data-table responsive-table subscriber-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Origem</th>
                <th>Consentimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Nome">
                    <input
                      className="input"
                      value={item.name}
                      onChange={(event) =>
                        updateLocal(item.id, "name", event.target.value)
                      }
                    />
                  </td>
                  <td data-label="E-mail">
                    <input
                      className="input"
                      type="email"
                      value={item.email}
                      onChange={(event) =>
                        updateLocal(item.id, "email", event.target.value)
                      }
                    />
                  </td>
                  <td data-label="Status">
                    <select
                      className="select"
                      value={item.status}
                      onChange={(event) =>
                        updateLocal(item.id, "status", event.target.value)
                      }
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </td>
                  <td data-label="Origem">
                    <small>{item.source_path}</small>
                  </td>
                  <td data-label="Consentimento">
                    <small>
                      {new Date(item.consented_at).toLocaleString("pt-BR")}
                    </small>
                  </td>
                  <td data-label="Ações">
                    <div className="row-actions">
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => saveSubscriber(item)}
                        title="Salvar"
                      >
                        <Save size={15} />
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removeSubscriber(item)}
                        title="Excluir definitivamente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!result.items.length && (
            <div className="empty">Nenhum inscrito encontrado.</div>
          )}
        </div>
        <div className="subscriber-pagination">
          <span>
            Página {result.page} de {result.pages}
          </span>
          <div>
            <button
              className="btn btn-outline"
              disabled={result.page <= 1}
              onClick={() => load(result.page - 1)}
            >
              Anterior
            </button>
            <button
              className="btn btn-outline"
              disabled={result.page >= result.pages}
              onClick={() => load(result.page + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      </section>

      <form className="panel newsletter-settings-form" onSubmit={saveSettings}>
        <div className="section-heading">
          <div>
            <h2>Configuração do formulário</h2>
            <p>Textos usados automaticamente ao final dos artigos.</p>
          </div>
        </div>
        <div className="field">
          <label>Título</label>
          <input
            className="input"
            value={settings.title || ""}
            onChange={(event) =>
              setSettings({ ...settings, title: event.target.value })
            }
          />
        </div>
        <div className="field">
          <label>Descrição</label>
          <textarea
            className="textarea"
            rows={3}
            value={settings.description || ""}
            onChange={(event) =>
              setSettings({ ...settings, description: event.target.value })
            }
          />
        </div>
        <div className="field">
          <label>Texto do botão</label>
          <input
            className="input"
            value={settings.button_label || ""}
            onChange={(event) =>
              setSettings({ ...settings, button_label: event.target.value })
            }
          />
        </div>
        <div className="field">
          <label>Texto do consentimento</label>
          <textarea
            className="textarea"
            rows={3}
            value={settings.consent_text || ""}
            onChange={(event) =>
              setSettings({ ...settings, consent_text: event.target.value })
            }
          />
        </div>
        <button className="btn btn-primary">
          <Save size={17} /> Salvar configuração
        </button>
      </form>
      <p
        className="form-success subscriber-message"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  );
}
