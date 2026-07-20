"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AdminMobileMenu({ admin }: { admin: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')];
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);
  return <>
    <button ref={triggerRef} className="admin-menu-button" type="button" aria-label="Abrir navegação do painel" aria-expanded={open} aria-controls="mobile-admin-menu" onClick={() => setOpen(true)}><Menu/></button>
    {open && <div className="drawer-layer" id="mobile-admin-menu">
      <button className="drawer-backdrop" type="button" aria-label="Fechar navegação" onClick={close}/>
      <aside ref={panelRef} className="drawer-panel drawer-panel-left admin-drawer" role="dialog" aria-modal="true" aria-label="Navegação do painel">
        <div className="drawer-head"><strong>GTChat</strong><button className="drawer-close" type="button" aria-label="Fechar navegação" onClick={close}><X/></button></div>
        <nav className="drawer-nav">
          <Link ref={firstLinkRef} href="/" onClick={close}>Ver blog</Link>
          {admin && <><Link href="/admin" onClick={close}>Visão geral</Link><Link href="/admin/artigos" onClick={close}>Artigos</Link><Link href="/admin/usuarios" onClick={close}>Usuários</Link><Link href="/admin/aparencia" onClick={close}>Aparência</Link><Link href="/admin/configuracoes" onClick={close}>Configurações</Link></>}
          {!admin && <Link href="/publicar" onClick={close}>Meus artigos</Link>}
        </nav>
      </aside>
    </div>}
  </>;
}
