import { AdminShell } from "@/components/admin-shell";
import { ThemeEditor } from "@/components/theme-editor";
import { requireUser } from "@/lib/auth";
import { getHomeBlocks, getSettings } from "@/lib/db";

export default async function AppearancePage() {
  const user = await requireUser("admin");
  return <AdminShell user={user} title="Aparência"><div className="appearance-page"><ThemeEditor initialSettings={getSettings()} initialBlocks={getHomeBlocks()}/></div></AdminShell>;
}
