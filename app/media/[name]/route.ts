import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
export async function GET(_:Request,{params}:{params:Promise<{name:string}>}){const {name}=await params;if(!/^[a-zA-Z0-9.-]+$/.test(name))notFound();const media=db.prepare("SELECT mime_type FROM media WHERE stored_name=?").get(name) as {mime_type:string}|undefined;if(!media)notFound();try{const data=await fs.readFile(path.join(path.resolve(process.env.UPLOADS_DIR||"./data/uploads"),name));return new Response(data,{headers:{"Content-Type":media.mime_type,"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}})}catch{notFound()}}
