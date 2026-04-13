import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const locations = await prisma.location.findMany({ where: { tenantId }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ success: true, data: { locations } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const { name } = await req.json();
  const maxOrder = await prisma.location.aggregate({ where: { tenantId }, _max: { sortOrder: true } });
  const location = await prisma.location.create({ data: { tenantId, name, sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 } });
  return NextResponse.json({ success: true, data: { location } }, { status: 201 });
}
