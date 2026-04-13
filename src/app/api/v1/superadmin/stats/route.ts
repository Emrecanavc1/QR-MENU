import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "SUPER_ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  const [totalTenants, activeTenants, trialTenants, recentTenants, revenueAgg] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.tenant.count({ where: { status: "TRIAL" } }),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, slug: true, plan: true, status: true, createdAt: true },
    }),
    prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalTenants,
      activeTenants,
      trialTenants,
      totalRevenue: revenueAgg._sum.amount ?? 0,
      recentTenants,
    },
  });
}
