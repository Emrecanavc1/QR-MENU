import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const items = await prisma.menuItem.findMany({
    where: { tenantId, ...(categoryId ? { categoryId } : {}) },
    include: { variants: true, extras: true, category: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ success: true, data: { items } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });
  const body = await req.json();
  const maxOrder = await prisma.menuItem.aggregate({ where: { tenantId, categoryId: body.categoryId }, _max: { sortOrder: true } });
  const item = await prisma.menuItem.create({
    data: {
      tenantId,
      categoryId: body.categoryId,
      name: body.name,
      description: body.description,
      price: body.price,
      calories: body.calories,
      preparationTime: body.preparationTime,
      allergens: body.allergens ?? [],
      tags: body.tags ?? [],
      isAvailable: body.isAvailable ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });
  return NextResponse.json({ success: true, data: { item } }, { status: 201 });
}
