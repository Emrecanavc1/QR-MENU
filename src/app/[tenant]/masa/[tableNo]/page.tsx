import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MenuClient } from "@/components/menu/MenuClient";

interface Props {
  params: { tenant: string; tableNo: string };
  searchParams: { t?: string };
}

export default async function MenuPage({ params, searchParams }: Props) {
  // Tenant ve masa doğrulama
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.tenant },
    select: { id: true, name: true, logoUrl: true, coverUrl: true, primaryColor: true, currency: true, taxRate: true, wifiName: true, wifiPassword: true, instagramUrl: true },
  });
  if (!tenant) notFound();

  const tableNo = parseInt(params.tableNo);
  if (isNaN(tableNo)) notFound();

  const table = await prisma.table.findFirst({
    where: { tenantId: tenant.id, number: tableNo },
  });
  if (!table) notFound();

  // QR token doğrulama (güvenlik)
  if (searchParams.t && searchParams.t !== table.qrToken) notFound();

  // Menü verisi
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

  const filteredCategories = categories.filter((cat) => {
    if (!cat.availableFrom || !cat.availableTo) return true;
    return currentTime >= cat.availableFrom && currentTime <= cat.availableTo;
  });

  return (
    <MenuClient
      tenant={tenant}
      table={{ id: table.id, number: table.number, name: table.name }}
      tenantSlug={params.tenant}
      categories={filteredCategories as Parameters<typeof MenuClient>[0]["categories"]}
    />
  );
}
