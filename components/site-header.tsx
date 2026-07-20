import Link from "next/link";
import { Menu, PenLine } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/db";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const settings = getSettings();
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand">{settings.logo_url?<img src={settings.logo_url} alt={settings.logo_text||"GTChat"} style={{height:38,width:"auto"}}/>:<span className="brand-mark">GT</span>}{settings.logo_text || "GTChat"}</Link>
    <nav className="main-nav" aria-label="Navegação principal"><Link href="/">Início</Link><Link href="/artigos">Artigos</Link><a href="https://vibecodex.pro">Sobre a GTChat</a></nav>
    <div className="header-actions">{user ? <Link className="btn btn-primary" href={user.role === "admin" ? "/admin" : "/publicar"}><PenLine size={17}/> Painel</Link> : <Link className="btn btn-outline" href="/entrar">Entrar</Link>}<Menu className="mobile-nav"/></div>
  </div></header>;
}
