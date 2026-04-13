import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const { status, itemId, itemStatus } = await req.json();

  if (itemId && itemStatus) {
    // Tek ürünün durumunu güncelle
    await prisma.orderItem.updateMany({
      where: { id: itemId, order: { id: params.id, tenantId } },
      data: { status: itemStatus },
    });
  }

  if (status) {
    // Tenant kontrolü ile order güncelle
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { tenantId: true, tableId: true },
    });
    if (!order || order.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Sipariş bulunamadı" }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    // Sadece iptal ise masayı boşalt (Teslim edildiğinde ödeme bekleniyor olabilir)
    if (status === OrderStatus.CANCELLED) {
      const activeOrders = await prisma.order.count({
        where: { tableId: order.tableId, status: { in: ["PENDING", "PREPARING", "READY"] } },
      });
      if (activeOrders === 0) {
        await prisma.table.update({ where: { id: order.tableId }, data: { status: "EMPTY" } });
      }
    }
  }

  return NextResponse.json({ success: true });
}
