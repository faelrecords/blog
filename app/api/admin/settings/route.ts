import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db, getSettings } from "@/lib/db";
import { sameOrigin } from "@/lib/request";
const schema=z.record(z.string(),z.string().max(2000));const allowed=new Set(["site_title","site_description","footer_text","linkedin_url","instagram_url"]);
export async function GET(){if(!await apiUser("admin"))return NextResponse.json({error:"Não autorizado"},{status:401});return NextResponse.json(getSettings())}
export async function PUT(request:NextRequest){const user=await apiUser("admin");if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});if(!sameOrigin(request))return NextResponse.json({error:"Origem inválida"},{status:403});const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Dados inválidos"},{status:400});const save=db.prepare("INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");const transaction=db.transaction(()=>Object.entries(parsed.data).forEach(([key,value])=>{if(allowed.has(key))save.run(key,value)}));transaction();return NextResponse.json({ok:true})}
