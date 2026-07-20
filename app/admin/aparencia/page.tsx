import { AdminShell } from "@/components/admin-shell";
import { GlobalAppearanceEditor } from "@/components/global-appearance-editor";
import { requireUser } from "@/lib/auth";
import { db, getHomeBlocks, getSettings } from "@/lib/db";

export default async function AppearancePage() { const user = await requireUser("admin"); const home = db.prepare("SELECT id FROM pages WHERE is_home=1 LIMIT 1").get() as { id: number }; return <AdminShell user={user} title="Aparência"><div className="app-content"><GlobalAppearanceEditor initialSettings={getSettings()} blocks={getHomeBlocks()} homePageId={home.id}/></div></AdminShell>; }
