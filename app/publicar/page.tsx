import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function WriterPage() {
  const user = await requireUser();
  const posts = db.prepare(`SELECT p.*,c.name category_name,(SELECT note FROM post_reviews r WHERE r.post_id=p.id AND r.action='solicitar_alteracoes' ORDER BY r.id DESC LIMIT 1) review_note FROM posts p LEFT JOIN categories c ON c.id=p.category_id ${user.role === "admin" ? "" : "WHERE p.author_id=?"} ORDER BY p.updated_at DESC`).all(...(user.role === "admin" ? [] : [user.id])) as { id: number; title: string; status: string; category_name: string | null; updated_at: string; review_note: string | null }[];
  return <AdminShell user={user} title="Espaço editorial"><div className="app-content">
    <div className="page-head"><div><h1 className="app-title">{user.role === "admin" ? "Criar e editar" : "Meus artigos"}</h1><p className="muted">Escreva com tranquilidade. Seus rascunhos são salvos automaticamente.</p></div><Link className="btn btn-primary" href="/publicar/novo">+ Novo artigo</Link></div>
    <div className="panel" style={{ marginTop: 24 }}><div className="table-wrap"><table className="data-table responsive-table"><thead><tr><th>Artigo</th><th>Categoria</th><th>Status</th><th>Atualizado</th><th>Ações</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}>
      <td data-label="Artigo"><strong>{post.title || "Sem título"}</strong>{post.review_note && <small style={{ display: "block", color: "#a61b1b" }}>Há ajustes solicitados</small>}</td>
      <td data-label="Categoria">{post.category_name || "—"}</td>
      <td data-label="Status"><span className={`status status-${post.status}`}>{post.status.replaceAll("_", " ")}</span></td>
      <td data-label="Atualizado">{new Date(post.updated_at).toLocaleString("pt-BR")}</td>
      <td data-label="Ações"><Link className="btn btn-outline" href={`/publicar/${post.id}`}>Editar</Link></td>
    </tr>)}</tbody></table></div>{!posts.length && <div className="empty"><h2>Seu primeiro artigo começa aqui</h2><Link className="btn btn-primary" href="/publicar/novo">Criar artigo</Link></div>}</div>
  </div></AdminShell>;
}
