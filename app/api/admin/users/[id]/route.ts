import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { sameOrigin } from "@/lib/request";
export async function PUT(request:NextRequest,{params}:{params:Promise<{id:string}>}){const user=await apiUser("admin");if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});if(!sameOrigin(request))return NextResponse.json({error:"Origem inválida"},{status:403});const {id}=await params;const body=await request.json();if(Number(id)===user.id&&body.active===false)return NextResponse.json({error:"Você não pode desativar sua própria conta."},{status:400});if(typeof body.active==="boolean")db.prepare("UPDATE users SET active=? WHERE id=?").run(body.active?1:0,id);if(body.password){if(String(body.password).length<10)return NextResponse.json({error:"A senha deve ter pelo menos 10 caracteres."},{status:400});db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(hashPassword(String(body.password)),id);db.prepare("DELETE FROM sessions WHERE user_id=?").run(id)}return NextResponse.json({ok:true})}
