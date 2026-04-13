import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const categories = await prisma.menuCategory.findMany({ where: { tenantId }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ success: true, data: { categories } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const body = await req.json();
  const maxOrder = await prisma.menuCategory.aggregate({ where: { tenantId }, _max: { sortOrder: true } });
  const category = await prisma.menuCategory.create({
    data: { tenantId, name: body.name, availableFrom: body.availableFrom, availableTo: body.availableTo, sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 },
  });
  return NextResponse.json({ success: true, data: { category } }, { status: 201 });
}
