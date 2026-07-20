import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { PageBuilderEditor } from "@/components/page-builder-editor";
import { requireUser } from "@/lib/auth";
import { db, publicPosts } from "@/lib/db";
import { parseBuilderDocument } from "@/lib/page-builder";

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("admin"); const { id } = await params;
  const page = db.prepare("SELECT id,title,slug,status,is_home,seo_title,seo_description,draft_json FROM pages WHERE id=?").get(id) as { id: number; title: string; slug: string; status: string; is_home: number; seo_title: string; seo_description: string; draft_json: string } | undefined;
  if (!page) notFound();
  const categories = db.prepare("SELECT c.id,c.name,c.slug,c.color,COUNT(p.id) total FROM categories c LEFT JOIN posts p ON p.category_id=c.id GROUP BY c.id ORDER BY c.name").all() as { id: number; name: string; slug: string; color: string; total: number }[];
  const reusable = db.prepare("SELECT id,name,section_json,updated_at FROM reusable_sections ORDER BY name").all() as { id: number; name: string; section_json: string; updated_at: string }[];
  return <AdminShell user={user} title="Editor de páginas"><PageBuilderEditor page={page} initialDocument={parseBuilderDocument(page.draft_json)} posts={publicPosts(12)} categories={categories} initialReusable={reusable}/></AdminShell>;
}
