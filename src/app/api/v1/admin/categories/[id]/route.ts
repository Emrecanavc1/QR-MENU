import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const body = await req.json();

  // Tenant kontrolü
  const existing = await prisma.menuCategory.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return NextResponse.json({ success: false, error: "Kategori bulunamadı" }, { status: 404 });

  const category = await prisma.menuCategory.update({
    where: { id: params.id },
    data: { ...body },
  });
  return NextResponse.json({ success: true, data: { category } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  await prisma.menuCategory.deleteMany({ where: { id: params.id, tenantId } });
  return NextResponse.json({ success: true });
}
