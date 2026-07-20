"use client";

import Link from "next/link";
import { ChevronDown, FileText, LogOut, PanelsTopLeft, Settings, UserRound, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/db";

export function AdminProfileMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const admin = user.role === "admin";

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); window.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("keydown", escape); };
  }, [open]);

  return <div className="profile-menu" ref={rootRef}>
    <button type="button" className="profile-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className="profile-avatar"><UserRound size={19}/></span><span className="profile-trigger-copy"><strong>{user.name}</strong><small>{admin ? "Administrador" : "Redator"}</small></span><ChevronDown size={16}/>
    </button>
    {open && <div className="profile-dropdown" role="menu">
      <div className="profile-dropdown-head"><strong>{user.name}</strong><small>@{user.username}</small></div>
      <nav>{admin ? <><Link href="/admin/paginas" role="menuitem" onClick={() => setOpen(false)}><PanelsTopLeft size={17}/> Gerenciar páginas</Link><Link href="/admin/usuarios" role="menuitem" onClick={() => setOpen(false)}><Users size={17}/> Gerenciar usuários</Link><Link href="/admin/configuracoes" role="menuitem" onClick={() => setOpen(false)}><Settings size={17}/> Configurações</Link></> : <Link href="/publicar" role="menuitem" onClick={() => setOpen(false)}><FileText size={17}/> Meus artigos</Link>}</nav>
      <form action="/api/auth/logout" method="post"><button type="submit" role="menuitem"><LogOut size={17}/> Sair</button></form>
    </div>}
  </div>;
}
