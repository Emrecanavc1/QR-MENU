import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { tenant_slug: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.tenant_slug },
    select: { id: true, name: true, logoUrl: true, primaryColor: true, currency: true, wifiName: true, wifiPassword: true, instagramUrl: true },
  });

  if (!tenant) return NextResponse.json({ success: false, error: "İşletme bulunamadı" }, { status: 404 });

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: tenant.id, isActive: true },
    include: {
      menuItems: {
        where: { isAvailable: true },
        include: { variants: true, extras: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Zaman filtresi uygula
  const filteredCategories = categories.filter((cat) => {
    if (!cat.availableFrom || !cat.availableTo) return true;
    return currentTime >= cat.availableFrom && currentTime <= cat.availableTo;
  });

  return NextResponse.json({ success: true, data: { tenant, categories: filteredCategories } });
}
