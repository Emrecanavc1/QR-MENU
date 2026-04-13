import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      where: { tenantId, createdAt: { gte: dayStart, lte: dayEnd } },
      include: { orderItems: { include: { item: { select: { name: true } } } } },
    }),
    prisma.payment.findMany({
      where: { tenantId, paidAt: { gte: dayStart, lte: dayEnd }, status: "COMPLETED" },
    }),
  ]);

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - cancelledOrders || 1) : 0;

  // Saatlik gelir (0-23)
  const hourlyRevenue = Array.from({ length: 24 }, (_, h) => {
    const hourPayments = payments.filter((p) => new Date(p.paidAt!).getHours() === h);
    return { hour: h, revenue: hourPayments.reduce((s, p) => s + p.amount, 0), count: hourPayments.length };
  });

  // Ürün performansı
  const itemCounts: Record<string, { name: unknown; count: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.orderItems) {
      if (!itemCounts[item.itemId]) {
        itemCounts[item.itemId] = { name: item.item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.itemId].count += item.quantity;
      itemCounts[item.itemId].revenue += item.unitPrice * item.quantity;
    }
  }
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id, data]) => ({ id, ...data }));

  // Ödeme yöntemi dağılımı
  const paymentMethodDist: Record<string, number> = {};
  for (const p of payments) {
    paymentMethodDist[p.provider] = (paymentMethodDist[p.provider] ?? 0) + p.amount;
  }

  return NextResponse.json({
    success: true,
    data: {
      date: dayStart.toISOString(),
      totalRevenue,
      totalOrders,
      cancelledOrders,
      avgOrderValue,
      hourlyRevenue,
      topItems,
      paymentMethodDist,
    },
  });
}
