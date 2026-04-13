import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false, error: "Tenant bulunamadı" }, { status: 401 });

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId },
    include: { menuItems: { include: { variants: true, extras: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ success: true, data: { categories } });
}
