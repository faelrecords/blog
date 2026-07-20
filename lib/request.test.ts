import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { sameOrigin } from "./request";
describe("proteção de origem",()=>{it("aceita o host público encaminhado pelo proxy",()=>{const request=new NextRequest("http://localhost:3000/api/posts",{headers:{origin:"https://blog.exemplo.com","x-forwarded-host":"blog.exemplo.com",host:"localhost:3000"}});expect(sameOrigin(request)).toBe(true)});it("rejeita origem externa",()=>{const request=new NextRequest("http://localhost:3000/api/posts",{headers:{origin:"https://malicioso.exemplo",host:"localhost:3000"}});expect(sameOrigin(request)).toBe(false)})});
