"use client";

import Link from "next/link";
import { FileText, Home, LayoutTemplate, PanelLeftClose, PanelLeftOpen, PanelsTopLeft, PenLine, Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const adminLinks = [
  { href: "/admin", label: "Visão geral", icon: LayoutTemplate, exact: true },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/paginas", label: "Páginas", icon: PanelsTopLeft },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/aparencia", label: "Aparência", icon: PenLine },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { setCollapsed(localStorage.getItem("gtchat-sidebar-collapsed") === "1"); }, []);
  function toggle() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("gtchat-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }

  const links = admin ? adminLinks : [{ href: "/publicar", label: "Meus artigos", icon: PenLine }];
  return <aside className={`sidebar admin-sidebar ${collapsed ? "is-collapsed" : ""}`}>
    <div className="admin-sidebar-brand"><div className="sidebar-brand-copy"><strong>GTChat</strong><small>{admin ? "Administração" : "Publicação"}</small></div><button type="button" className="sidebar-collapse" onClick={toggle} aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"} title={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button></div>
    <nav aria-label="Navegação administrativa">
      <Link href="/" title="Ver blog"><Home size={19}/><span className="nav-label">Ver blog</span></Link>
      {links.map(({ href, label, icon: Icon, ...item }) => { const active = "exact" in item ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} title={label} className={active ? "active" : ""}><Icon size={19}/><span className="nav-label">{label}</span></Link>; })}
    </nav>
  </aside>;
}
