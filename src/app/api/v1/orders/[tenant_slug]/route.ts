import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { CreateOrderRequest } from "@/types";

export async function POST(req: NextRequest, { params }: { params: { tenant_slug: string } }) {
  try {
    const body: CreateOrderRequest = await req.json();
    const { tableId, sessionToken, items, notes } = body;

    if (!tableId || !sessionToken || !items?.length) {
      return NextResponse.json({ success: false, error: "Geçersiz sipariş verisi" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenant_slug } });
    if (!tenant) return NextResponse.json({ success: false, error: "İşletme bulunamadı" }, { status: 404 });

    const table = await prisma.table.findFirst({ where: { id: tableId, tenantId: tenant.id } });
    if (!table) return NextResponse.json({ success: false, error: "Masa bulunamadı" }, { status: 404 });

    // Fiyat doğrulama ve toplam hesaplama
    let totalAmount = 0;
    const orderItemsData = await Promise.all(
      items.map(async (item) => {
        const menuItem = await prisma.menuItem.findFirst({ where: { id: item.menuItemId, tenantId: tenant.id, isAvailable: true } });
        if (!menuItem) throw new Error(`Ürün bulunamadı: ${item.menuItemId}`);

        const unitPrice = menuItem.price + (item.selectedVariant?.option.price ?? 0);
        const extrasTotal = item.selectedExtras?.reduce((s, e) => s + e.price, 0) ?? 0;
        totalAmount += (unitPrice + extrasTotal) * item.quantity;

        return {
          itemId: item.menuItemId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          selectedVariant: item.selectedVariant ? JSON.stringify(item.selectedVariant) : undefined,
          selectedExtras: item.selectedExtras ? JSON.stringify(item.selectedExtras) : undefined,
          notes: item.notes,
        };
      })
    );

    const taxAmount = (totalAmount * tenant.taxRate) / 100;

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        tableId,
        sessionToken,
        totalAmount: totalAmount + taxAmount,
        taxAmount,
        notes,
        orderItems: { create: orderItemsData },
      },
      include: { orderItems: { include: { item: true } }, table: true },
    });

    // Masa durumunu OCCUPIED yap
    await prisma.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });

    // TODO: WebSocket ile mutfak ve garson paneline bildir
    // emitToTenant(tenant.id, { type: "NEW_ORDER", payload: order });

    return NextResponse.json({ success: true, data: { order } }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: "Sipariş oluşturulurken hata oluştu" }, { status: 500 });
  }
}
