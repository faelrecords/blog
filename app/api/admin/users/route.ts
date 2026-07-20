import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { sameOrigin } from "@/lib/request";
const create=z.object({name:z.string().min(2).max(100),username:z.string().regex(/^[a-z0-9._-]{3,32}$/),password:z.string().min(10),role:z.enum(["admin","redator"]).default("redator")});
export async function GET(){if(!await apiUser("admin"))return NextResponse.json({error:"Não autorizado"},{status:401});return NextResponse.json(db.prepare("SELECT id,name,username,role,active,created_at FROM users ORDER BY name").all())}
export async function POST(request:NextRequest){const user=await apiUser("admin");if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});if(!sameOrigin(request))return NextResponse.json({error:"Origem inválida"},{status:403});const parsed=create.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Verifique os dados. A senha deve ter pelo menos 10 caracteres."},{status:400});try{const d=parsed.data;const result=db.prepare("INSERT INTO users (name,username,password_hash,role,active,created_at) VALUES (?,?,?,?,1,?)").run(d.name,d.username,hashPassword(d.password),d.role,new Date().toISOString());return NextResponse.json({id:Number(result.lastInsertRowid)})}catch{return NextResponse.json({error:"Este nome de usuário já está em uso."},{status:409})}}
