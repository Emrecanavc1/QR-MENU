import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { tenantId, role: { in: [UserRole.WAITER, UserRole.KITCHEN] } },
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: { users } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const { name, email, password, pin, role } = await req.json();

  if (!name || (!email && !pin)) {
    return NextResponse.json({ success: false, error: "Ad ve e-posta veya PIN gereklidir" }, { status: 400 });
  }

  const validRoles = [UserRole.WAITER, UserRole.KITCHEN];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ success: false, error: "Geçersiz rol" }, { status: 400 });
  }

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ success: false, error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
  }

  const data: Parameters<typeof prisma.user.create>[0]["data"] = { tenantId, name, role };
  if (email) data.email = email.toLowerCase();
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  if (pin) data.pinHash = await bcrypt.hash(pin, 12);

  const user = await prisma.user.create({ data });
  return NextResponse.json({ success: true, data: { user: { id: user.id, name: user.name, role: user.role } } }, { status: 201 });
}
