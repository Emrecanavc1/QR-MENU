import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createStripePaymentIntent } from "@/lib/stripe";
import { initiateIyzicoPayment } from "@/lib/iyzico";
import { PaymentProvider } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { order_id: string } }) {
  try {
    const { provider, payerEmail, payerPhone, tipAmount = 0 } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: params.order_id },
      include: { tenant: true, orderItems: { include: { item: true } } },
    });

    if (!order) return NextResponse.json({ success: false, error: "Sipariş bulunamadı" }, { status: 404 });

    const totalWithTip = order.totalAmount + tipAmount;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/v1/payments/${params.order_id}/callback`;

    let paymentData: unknown;

    if (provider === "IYZICO") {
      paymentData = await initiateIyzicoPayment(order.id, totalWithTip, callbackUrl);
    } else if (provider === "STRIPE") {
      paymentData = await createStripePaymentIntent(totalWithTip, order.tenant.currency, {
        orderId: order.id,
        tenantId: order.tenantId,
      });
    } else {
      // Nakit ödeme
      await prisma.payment.create({
        data: {
          tenantId: order.tenantId,
          orderId: order.id,
          provider: PaymentProvider.CASH,
          amount: totalWithTip,
          currency: order.tenant.currency,
          status: "COMPLETED",
          paidAt: new Date(),
          payerEmail,
          payerPhone,
        },
      });
      await prisma.order.update({ where: { id: order.id }, data: { status: "DELIVERED", tipAmount } });
      await prisma.table.update({ where: { id: order.tableId }, data: { status: "EMPTY" } });
      return NextResponse.json({ success: true, data: { method: "CASH" } });
    }

    // Ödeme kaydı oluştur
    await prisma.payment.create({
      data: {
        tenantId: order.tenantId,
        orderId: order.id,
        provider: provider as PaymentProvider,
        amount: totalWithTip,
        currency: order.tenant.currency,
        status: "PENDING",
        payerEmail,
        payerPhone,
      },
    });

    if (tipAmount > 0) {
      await prisma.order.update({ where: { id: order.id }, data: { tipAmount } });
    }

    return NextResponse.json({ success: true, data: { paymentData } });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json({ success: false, error: "Ödeme başlatılamadı" }, { status: 500 });
  }
}
