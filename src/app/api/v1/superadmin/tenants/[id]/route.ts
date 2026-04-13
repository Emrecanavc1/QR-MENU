import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SubscriptionPlan, TenantStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const role = req.headers.get("x-user-role");
  if (role !== "SUPER_ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  const { plan, status, customDomain } = await req.json();

  const updateData: Record<string, unknown> = {};
  if (plan && Object.values(SubscriptionPlan).includes(plan)) {
    updateData.plan = plan;
    // Aboneliği de güncelle
    await prisma.subscription.updateMany({
      where: { tenantId: params.id },
      data: { plan },
    });
  }
  if (status && Object.values(TenantStatus).includes(status)) {
    updateData.status = status;
  }
  if (customDomain !== undefined) {
    updateData.customDomain = customDomain || null;
  }

  const tenant = await prisma.tenant.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: { tenant } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const role = req.headers.get("x-user-role");
  if (role !== "SUPER_ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  // Soft delete — status'u CANCELLED yap
  await prisma.tenant.update({ where: { id: params.id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ success: true });
}
