import { AdminShell } from "@/components/admin-shell";
import { PostEditor } from "@/components/editor";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function NewPostPage(){const user=await requireUser();const categories=db.prepare("SELECT id,name FROM categories ORDER BY name").all() as {id:number;name:string}[];return <AdminShell user={user} title="Novo artigo"><PostEditor canPublish={user.role==="admin"} categories={categories} initial={{title:"",slug:"",excerpt:"",content_json:"{}",content_html:"",cover_image:"",cover_alt:"",category_id:null,tags_text:"",seo_title:"",seo_description:"",status:"rascunho",scheduled_at:null}}/></AdminShell>}
