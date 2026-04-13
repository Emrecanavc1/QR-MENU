import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  // Önceki ay
  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

  const [payments, prevPayments, orders, prevOrders] = await Promise.all([
    prisma.payment.findMany({ where: { tenantId, paidAt: { gte: monthStart, lte: monthEnd }, status: "COMPLETED" } }),
    prisma.payment.findMany({ where: { tenantId, paidAt: { gte: prevMonthStart, lte: prevMonthEnd }, status: "COMPLETED" } }),
    prisma.order.findMany({ where: { tenantId, createdAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.order.findMany({ where: { tenantId, createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
  ]);

  const currentRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const prevRevenue = prevPayments.reduce((s, p) => s + p.amount, 0);
  const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Günlük gelir (bu ay)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyRevenue = Array.from({ length: daysInMonth }, (_, d) => {
    const day = d + 1;
    const dayPayments = payments.filter((p) => new Date(p.paidAt!).getDate() === day);
    return { day, revenue: dayPayments.reduce((s, p) => s + p.amount, 0), count: dayPayments.length };
  });

  return NextResponse.json({
    success: true,
    data: {
      year, month,
      currentRevenue,
      prevRevenue,
      revenueChange,
      currentOrders: orders.length,
      prevOrders: prevOrders.length,
      ordersChange: prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : 0,
      dailyRevenue,
    },
  });
}
