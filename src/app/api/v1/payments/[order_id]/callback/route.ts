import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { order_id: string } }) {
  try {
    const body = await req.json();
    const { token, paymentIntentId, status } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.order_id },
      include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!order || !order.payments[0]) {
      return NextResponse.json({ success: false, error: "Ödeme bulunamadı" }, { status: 404 });
    }

    const payment = order.payments[0];
    const isSuccess = status === "success" || status === "succeeded";

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? "COMPLETED" : "FAILED",
        providerTransactionId: token ?? paymentIntentId,
        paidAt: isSuccess ? new Date() : null,
      },
    });

    if (isSuccess) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "DELIVERED" } });
      await prisma.table.update({ where: { id: order.tableId }, data: { status: "EMPTY" } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ success: false, error: "Callback işlemi başarısız" }, { status: 500 });
  }
}
