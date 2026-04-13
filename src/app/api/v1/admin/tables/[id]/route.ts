import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const body = await req.json();

  // Tenant kontrolü
  const existing = await prisma.table.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return NextResponse.json({ success: false, error: "Masa bulunamadı" }, { status: 404 });

  const table = await prisma.table.update({
    where: { id: params.id },
    data: { ...body },
  });
  return NextResponse.json({ success: true, data: { table } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  await prisma.table.deleteMany({ where: { id: params.id, tenantId } });
  return NextResponse.json({ success: true });
}
