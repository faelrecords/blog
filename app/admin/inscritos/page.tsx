import { AdminShell } from "@/components/admin-shell";
import { SubscriberManager } from "@/components/subscriber-manager";
import { requireUser } from "@/lib/auth";
import {
  getNewsletterSettings,
  listSubscribers,
  newsletterStats,
} from "@/lib/newsletter-db";

export default async function SubscribersPage() {
  const user = await requireUser("admin");
  return (
    <AdminShell user={user} title="Inscritos">
      <div className="app-content">
        <h1 className="app-title">Lista de e-mails</h1>
        <p className="muted">
          Gerencie os leitores cadastrados e exporte os contatos ativos.
        </p>
        <SubscriberManager
          initial={listSubscribers({ page: 1 })}
          initialStats={newsletterStats()}
          initialSettings={getNewsletterSettings()}
        />
      </div>
    </AdminShell>
  );
}
