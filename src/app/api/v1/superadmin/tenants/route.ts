import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "SUPER_ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        subscription: { select: { currentPeriodEnd: true, trialEndsAt: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tenant.count(),
  ]);

  return NextResponse.json({ success: true, data: { tenants, total, page } });
}

import bcrypt from "bcryptjs";
import { UserRole, TenantStatus, SubscriptionPlan } from "@prisma/client";

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "SUPER_ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  try {
    const { name, slug, contactEmail, adminPassword } = await req.json();

    if (!name || !slug || !contactEmail || !adminPassword) {
      return NextResponse.json({ success: false, error: "Tüm alanlar zorunludur" }, { status: 400 });
    }

    // Tenant veya User zaten var mı kontrolü
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      return NextResponse.json({ success: false, error: "Bu işletme adresi (slug) zaten kullanımda" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: contactEmail } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var" }, { status: 400 });
    }

    // Transaction ile tenant ve admin user oluşturma
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      // 1. İşletme
      const newTenant = await tx.tenant.create({
        data: {
          name,
          slug,
          contactEmail,
          status: TenantStatus.TRIAL,
          plan: SubscriptionPlan.FREE,
          primaryColor: "#f97316", // Varsayılan renk
        },
      });

      // 2. Business Admin
      const newAdmin = await tx.user.create({
        data: {
          tenantId: newTenant.id,
          name: `${name} Yetkilisi`,
          email: contactEmail,
          passwordHash: hashedPassword,
          role: UserRole.BUSINESS_ADMIN,
        },
      });

      return { tenant: newTenant, admin: newAdmin };
    });

    return NextResponse.json({ success: true, data: { tenant: result.tenant } });

  } catch (error) {
    console.error("İşletme ekleme hatası:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası, lütfen tekrar deneyin" }, { status: 500 });
  }
}
