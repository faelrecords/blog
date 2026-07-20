import type { SessionUser } from "@/lib/db";
import { AdminMobileMenu } from "@/components/admin-mobile-menu";
import { AdminProfileMenu } from "@/components/admin-profile-menu";
import { AdminSidebar } from "@/components/admin-sidebar";

export function AdminShell({ user, title, children }: { user: SessionUser; title: string; children: React.ReactNode }) {
  const admin = user.role === "admin";
  return <div className="app-shell"><AdminSidebar admin={admin}/><main className="app-main"><header className="app-topbar"><AdminMobileMenu admin={admin}/><strong>{title}</strong><AdminProfileMenu user={user}/></header>{children}</main></div>;
}
