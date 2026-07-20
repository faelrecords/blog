import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { tokenHash } from "@/lib/security";
export async function POST(request:NextRequest){const token=request.cookies.get(SESSION_COOKIE)?.value;if(token)db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash(token));const response=NextResponse.redirect(new URL("/",request.url),303);response.cookies.delete(SESSION_COOKIE);return response}
