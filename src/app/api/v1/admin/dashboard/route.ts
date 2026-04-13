import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    todayPayments,
    todayOrders,
    tables,
    recentOrders,
    itemCounts,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { tenantId, paidAt: { gte: todayStart }, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { tenantId, createdAt: { gte: todayStart } } }),
    prisma.table.findMany({ where: { tenantId }, select: { id: true, status: true } }),
    prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { table: { select: { number: true } }, orderItems: { select: { quantity: true, unitPrice: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["itemId"],
      where: { order: { tenantId, createdAt: { gte: todayStart } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const itemIds = itemCounts.map((i) => i.itemId);
  const itemDetails = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, name: true },
  });
  const topItems = itemCounts.map((ic) => ({
    ...ic,
    name: itemDetails.find((i) => i.id === ic.itemId)?.name ?? {},
  }));

  const activeTables = tables.filter((t) => t.status !== "EMPTY").length;

  // Saatlik gelir (son 12 saat)
  const hourlyData = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const h = new Date();
      h.setHours(h.getHours() - (11 - i), 0, 0, 0);
      const hEnd = new Date(h);
      hEnd.setMinutes(59, 59, 999);
      const sum = await prisma.payment.aggregate({
        where: { tenantId, paidAt: { gte: h, lte: hEnd }, status: "COMPLETED" },
        _sum: { amount: true },
      });
      return { hour: h.getHours(), revenue: sum._sum.amount ?? 0 };
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      todayRevenue: todayPayments._sum.amount ?? 0,
      todayOrders,
      activeTables,
      totalTables: tables.length,
      recentOrders,
      topItems,
      hourlyRevenue: hourlyData,
    },
  });
}
