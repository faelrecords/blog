import { AdminShell } from "@/components/admin-shell";
import { UserManager } from "@/components/user-manager";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function UsersPage(){const user=await requireUser("admin");const users=db.prepare("SELECT id,name,username,role,active,created_at FROM users ORDER BY name").all() as {id:number;name:string;username:string;role:string;active:number;created_at:string}[];return <AdminShell user={user} title="Usuários"><div className="app-content"><h1 className="app-title">Equipe editorial</h1><p className="muted">Crie acessos e controle quem pode escrever ou administrar.</p><div style={{marginTop:24}}><UserManager users={users}/></div></div></AdminShell>}
