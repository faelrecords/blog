import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { activeSubscribersForExport } from "@/lib/newsletter-db";
import { subscribersToCsv } from "@/lib/newsletter";

export async function GET() {
  if (!(await apiUser("admin")))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(subscribersToCsv(activeSubscribersForExport()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritos-gtchat-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
