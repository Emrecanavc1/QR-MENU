import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { order_id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.order_id },
    select: {
      id: true, status: true, totalAmount: true, taxAmount: true, tipAmount: true, createdAt: true,
      table: { 
        select: { 
          number: true, 
          name: true,
          tenant: { select: { name: true, slug: true, primaryColor: true, currency: true } }
        } 
      },
      orderItems: {
        select: { id: true, quantity: true, unitPrice: true, status: true, item: { select: { name: true } } },
      },
      payments: {
        select: { status: true }
      }
    },
  });
  if (!order) return NextResponse.json({ success: false, error: "Sipariş bulunamadı" }, { status: 404 });
  return NextResponse.json({ success: true, data: { order } });
}
