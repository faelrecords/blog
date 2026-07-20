import { AdminPagesManager } from "@/components/admin-pages-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PagesPage() { const user = await requireUser("admin"); const pages = db.prepare("SELECT id,title,slug,status,is_home,updated_at,published_at FROM pages ORDER BY is_home DESC,updated_at DESC").all() as { id: number; title: string; slug: string; status: string; is_home: number; updated_at: string; published_at: string | null }[]; return <AdminShell user={user} title="Páginas"><div className="app-content"><AdminPagesManager pages={pages}/></div></AdminShell>; }
