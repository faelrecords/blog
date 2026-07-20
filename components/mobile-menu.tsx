"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function MobileMenu({ panelHref, signedIn }: { panelHref: string; signedIn: boolean }) {
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
    <button ref={triggerRef} className="mobile-menu-button" type="button" aria-label="Abrir menu" aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen(true)}><Menu/></button>
    {open && <div className="drawer-layer" id="mobile-site-menu">
      <button className="drawer-backdrop" type="button" aria-label="Fechar menu" onClick={close}/>
      <aside ref={panelRef} className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu principal">
        <div className="drawer-head"><strong>Menu</strong><button className="drawer-close" type="button" aria-label="Fechar menu" onClick={close}><X/></button></div>
        <nav className="drawer-nav">
          <Link ref={firstLinkRef} href="/" onClick={close}>Início</Link>
          <Link href="/artigos" onClick={close}>Artigos</Link>
          <a href="https://vibecodex.pro" onClick={close}>Sobre a GTChat</a>
          <Link className="drawer-primary" href={panelHref} onClick={close}>{signedIn ? "Acessar painel" : "Entrar"}</Link>
        </nav>
      </aside>
    </div>}
  </>;
}
