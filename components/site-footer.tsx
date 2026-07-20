import Link from "next/link";
import { getSettings } from "@/lib/db";

export function SiteFooter() { const s=getSettings(); return <footer className="site-footer"><div className="container footer-inner"><div><div className="brand"><span className="brand-mark">GT</span>{s.logo_text || "GTChat"}</div><small>{s.footer_text}</small></div><div>© {new Date().getFullYear()} GTChat · <Link href="/artigos">Artigos</Link> · <a href={s.linkedin_url || "#"}>LinkedIn</a></div></div></footer> }
