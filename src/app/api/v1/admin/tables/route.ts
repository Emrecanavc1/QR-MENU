import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const tables = await prisma.table.findMany({
    where: { tenantId },
    include: { location: true },
    orderBy: { number: "asc" },
  });
  return NextResponse.json({ success: true, data: { tables } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const body = await req.json();

  const existing = await prisma.table.findFirst({ where: { tenantId, number: body.number } });
  if (existing) {
    return NextResponse.json({ success: false, error: "Bu masa numarası zaten mevcut" }, { status: 409 });
  }

  const table = await prisma.table.create({
    data: { tenantId, number: body.number, name: body.name, capacity: body.capacity ?? 4, locationId: body.locationId },
  });
  return NextResponse.json({ success: true, data: { table } }, { status: 201 });
}
