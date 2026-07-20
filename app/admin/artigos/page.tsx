import { AdminShell } from "@/components/admin-shell";
import { ReviewActions } from "@/components/review-actions";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminPosts() {
  const user = await requireUser("admin");
  const posts = db.prepare("SELECT p.id,p.title,p.status,p.updated_at,u.name author_name,c.name category_name FROM posts p JOIN users u ON u.id=p.author_id LEFT JOIN categories c ON c.id=p.category_id ORDER BY CASE WHEN p.status='em_revisao' THEN 0 ELSE 1 END,p.updated_at DESC").all() as { id: number; title: string; status: string; updated_at: string; author_name: string; category_name: string | null }[];
  return <AdminShell user={user} title="Artigos"><div className="app-content"><h1 className="app-title">Todos os artigos</h1><p className="muted">Revise, publique e acompanhe o conteúdo da equipe.</p><div className="panel" style={{ marginTop: 24 }}><div className="table-wrap"><table className="data-table responsive-table"><thead><tr><th>Título</th><th>Autor</th><th>Categoria</th><th>Status</th><th>Ações</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}>
    <td data-label="Título"><strong>{post.title}</strong><small style={{ display: "block" }}>{new Date(post.updated_at).toLocaleString("pt-BR")}</small></td>
    <td data-label="Autor">{post.author_name}</td><td data-label="Categoria">{post.category_name || "—"}</td>
    <td data-label="Status"><span className={`status status-${post.status}`}>{post.status.replaceAll("_", " ")}</span></td>
    <td data-label="Ações"><ReviewActions id={post.id} status={post.status} /></td>
  </tr>)}</tbody></table></div></div></div></AdminShell>;
}
