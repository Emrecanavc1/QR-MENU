import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const active = searchParams.get("active") === "true";
  const tableId = searchParams.get("tableId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where = {
    tenantId,
    ...(active ? { status: { in: ["PENDING", "PREPARING", "READY"] as const } } : {}),
    ...(tableId ? { tableId } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        table: true,
        orderItems: { include: { item: { select: { name: true, imageUrl: true } } } },
        payments: { select: { status: true, amount: true, provider: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { orders, total, page, limit } });
}
