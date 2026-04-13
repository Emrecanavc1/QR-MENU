import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const { name, isActive, password, pin } = await req.json();

  // Tenant kontrolü
  const existing = await prisma.user.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 });

  const updateData: Record<string, unknown> = {};

  if (name) updateData.name = name;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);
  if (pin) updateData.pinHash = await bcrypt.hash(pin, 12);

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
  });
  return NextResponse.json({ success: true, data: { user } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  await prisma.user.deleteMany({ where: { id: params.id, tenantId } });
  return NextResponse.json({ success: true });
}
