import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "SUPER_ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevAgg, totalOrders, activeTenants, newTenants, topTenantRevs] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.tenant.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.payment.groupBy({
      by: ["tenantId"],
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    }),
  ]);

  const tenantIds = topTenantRevs.map((t) => t.tenantId);
  const tenantNames = await prisma.tenant.findMany({
    where: { id: { in: tenantIds } },
    select: { id: true, name: true },
  });

  const topTenants = topTenantRevs.map((t) => ({
    id: t.tenantId,
    name: tenantNames.find((n) => n.id === t.tenantId)?.name ?? "Bilinmiyor",
    revenue: t._sum.amount ?? 0,
    orders: t._count.id,
  }));

  // Son 12 ayın aylık geliri
  const monthlyRevenue = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const [rev, newT] = await Promise.all([
        prisma.payment.aggregate({ where: { status: "COMPLETED", paidAt: { gte: d, lte: end } }, _sum: { amount: true } }),
        prisma.tenant.count({ where: { createdAt: { gte: d, lte: end } } }),
      ]);
      return {
        month: d.toLocaleString("tr-TR", { month: "short", year: "2-digit" }),
        revenue: rev._sum.amount ?? 0,
        tenants: newT,
      };
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue: totalRevAgg._sum.amount ?? 0,
      totalOrders,
      activeTenants,
      newTenants,
      monthlyRevenue,
      topTenants,
    },
  });
}
