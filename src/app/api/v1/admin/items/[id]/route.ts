import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const item = await prisma.menuItem.findFirst({
    where: { id: params.id, tenantId },
    include: { variants: true, extras: true, category: true },
  });
  if (!item) return NextResponse.json({ success: false, error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json({ success: true, data: { item } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const body = await req.json();

  // Tenant kontrolü
  const existing = await prisma.menuItem.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return NextResponse.json({ success: false, error: "Ürün bulunamadı" }, { status: 404 });

  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: { ...body },
    include: { variants: true, extras: true },
  });
  return NextResponse.json({ success: true, data: { item } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  await prisma.menuItem.deleteMany({ where: { id: params.id, tenantId } });
  return NextResponse.json({ success: true });
}
