"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: number; name: string; username: string; role: string; active: number; created_at: string };

export function UserManager({ users }: { users: User[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const data = await response.json();
    if (!response.ok) setError(data.error); else { event.currentTarget.reset(); router.refresh(); }
    setBusy(false);
  }
  async function update(id: number, body: object) {
    const response = await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) alert(data.error);
    router.refresh();
  }
  return <div className="settings-grid"><section className="panel"><h2>Equipe editorial</h2><div className="table-wrap"><table className="data-table responsive-table"><thead><tr><th>Nome</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}>
    <td data-label="Nome"><strong>{user.name}</strong><small style={{ display: "block" }}>@{user.username}</small></td><td data-label="Perfil">{user.role}</td>
    <td data-label="Status"><span className={`status ${user.active ? "status-publicado" : ""}`}>{user.active ? "Ativo" : "Desativado"}</span></td>
    <td data-label="Ações"><div className="actions"><button className="btn btn-ghost" onClick={() => update(user.id, { active: !user.active })}>{user.active ? "Desativar" : "Ativar"}</button><button className="btn btn-outline" onClick={() => { const password = prompt("Nova senha (mínimo 10 caracteres):"); if (password) update(user.id, { password }); }}>Redefinir senha</button></div></td>
  </tr>)}</tbody></table></div></section>
    <form className="panel" onSubmit={create}><h2>Novo usuário</h2>{error && <p className="form-error">{error}</p>}<div className="field"><label>Nome</label><input className="input" name="name" required /></div><div className="field"><label>Usuário</label><input className="input" name="username" pattern="[a-z0-9._-]{3,32}" required /></div><div className="field"><label>Senha provisória</label><input className="input" type="password" name="password" minLength={10} required /></div><div className="field"><label>Perfil</label><select className="select" name="role"><option value="redator">Redator</option><option value="admin">Administrador</option></select></div><button className="btn btn-primary" disabled={busy}>Criar usuário</button></form>
  </div>;
}
