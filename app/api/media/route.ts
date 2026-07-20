import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
const allowed:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};
export async function POST(request:NextRequest){const user=await apiUser();if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});const form=await request.formData();const file=form.get("file");if(!(file instanceof File)||!allowed[file.type])return NextResponse.json({error:"Envie uma imagem JPG, PNG, WebP ou GIF."},{status:400});const max=(Number(process.env.MAX_UPLOAD_MB)||5)*1024*1024;if(file.size>max)return NextResponse.json({error:"A imagem excede o limite permitido."},{status:413});const stored=`${Date.now()}-${randomBytes(8).toString("hex")}.${allowed[file.type]}`;const dir=path.resolve(process.env.UPLOADS_DIR||"./data/uploads");await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,stored),Buffer.from(await file.arrayBuffer()),{flag:"wx"});const result=db.prepare("INSERT INTO media (filename,stored_name,mime_type,size,uploaded_by,created_at) VALUES (?,?,?,?,?,?)").run(file.name.slice(0,250),stored,file.type,file.size,user.id,new Date().toISOString());return NextResponse.json({id:Number(result.lastInsertRowid),url:`/media/${stored}`})}
