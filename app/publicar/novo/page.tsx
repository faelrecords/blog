import { AdminShell } from "@/components/admin-shell";
import type { CategoryItem } from "@/components/category-manager";
import { PostEditor } from "@/components/editor";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function NewPostPage(){const user=await requireUser();const categories=db.prepare(`SELECT c.id,c.name,c.slug,c.color,COUNT(p.id) count FROM categories c LEFT JOIN posts p ON p.category_id=c.id GROUP BY c.id ORDER BY c.name COLLATE NOCASE`).all() as CategoryItem[];return <AdminShell user={user} title="Novo artigo"><PostEditor canPublish={user.role==="admin"} categories={categories} initial={{title:"",slug:"",excerpt:"",content_json:"{}",content_html:"",cover_image:"",cover_alt:"",category_id:null,tags_text:"",seo_title:"",seo_description:"",status:"rascunho",scheduled_at:null}}/></AdminShell>}
