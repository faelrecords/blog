import { AdminShell } from "@/components/admin-shell";
import { ThemeEditor } from "@/components/theme-editor";
import { requireUser } from "@/lib/auth";
import { getHomeBlocks, getSettings } from "@/lib/db";
export default async function AppearancePage(){const user=await requireUser("admin");return <AdminShell user={user} title="Aparência"><div className="app-content"><h1 className="app-title">Editor do tema</h1><p className="muted">Ajuste a marca e organize a página inicial com prévia ao vivo.</p><div style={{marginTop:24}}><ThemeEditor initialSettings={getSettings()} initialBlocks={getHomeBlocks()}/></div></div></AdminShell>}
