import Link from "next/link";
import { FileText, Home, LayoutTemplate, LogOut, PenLine, Settings, Users } from "lucide-react";
import type { SessionUser } from "@/lib/db";

export function AdminShell({ user, title, children }: { user: SessionUser; title: string; children: React.ReactNode }) {
  const admin = user.role === "admin";
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-title">GTChat <small style={{display:"block",fontSize:12,color:"#657064"}}>{admin?"Administração":"Publicação"}</small></div><nav><Link href="/"><Home size={18}/> Ver blog</Link>{admin&&<><Link href="/admin"><LayoutTemplate size={18}/> Visão geral</Link><Link href="/admin/artigos"><FileText size={18}/> Artigos</Link><Link href="/admin/usuarios"><Users size={18}/> Usuários</Link><Link href="/admin/aparencia"><PenLine size={18}/> Aparência</Link><Link href="/admin/configuracoes"><Settings size={18}/> Configurações</Link></>}<Link href="/publicar"><PenLine size={18}/> {admin?"Criar artigo":"Meus artigos"}</Link></nav><div className="sidebar-bottom"><p><strong>{user.name}</strong><br/><small>@{user.username}</small></p><form action="/api/auth/logout" method="post"><button className="btn btn-ghost" type="submit"><LogOut size={17}/> Sair</button></form></div></aside><main className="app-main"><header className="app-topbar"><strong>{title}</strong><span className="status">{admin?"Administrador":"Redator"}</span></header>{children}</main></div>;
}
