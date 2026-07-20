import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { listSubscribers, newsletterStats } from "@/lib/newsletter-db";

export async function GET(request: NextRequest) {
  if (!(await apiUser("admin")))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const statusValue = params.get("status");
  const periodValue = params.get("period");
  const status =
    statusValue === "active" || statusValue === "inactive"
      ? statusValue
      : "all";
  const period =
    periodValue === "7" || periodValue === "30" || periodValue === "90"
      ? periodValue
      : "all";
  return NextResponse.json({
    ...listSubscribers({
      query: params.get("query") || "",
      status,
      period,
      page: Number(params.get("page")) || 1,
    }),
    stats: newsletterStats(),
  });
}
