import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { SubscriptionPlan, TenantStatus, SubscriptionStatus, BillingCycle, UserRole } from "@prisma/client";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { businessName, slug, contactEmail, password, adminName } = await req.json();

    if (!businessName || !slug || !contactEmail || !password || !adminName) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tüm alanlar zorunludur" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Slug/email uniqueness kontrolü
    const [existingSlug, existingEmail] = await Promise.all([
      prisma.tenant.findUnique({ where: { slug } }),
      prisma.user.findUnique({ where: { email: contactEmail.toLowerCase() } }),
    ]);

    if (existingSlug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Bu menü linki zaten kullanılıyor" },
        { status: 409 }
      );
    }
    if (existingEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    // Transaction ile tenant + user + subscription oluştur
    const tenant = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          slug,
          name: businessName,
          contactEmail: contactEmail.toLowerCase(),
          plan: SubscriptionPlan.FREE,
          status: TenantStatus.TRIAL,
          currency: "TRY",
          taxRate: 8,
        },
      });

      await tx.subscription.create({
        data: {
          tenantId: newTenant.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.TRIALING,
          billingCycle: BillingCycle.MONTHLY,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          trialEndsAt: trialEnd,
        },
      });

      await tx.user.create({
        data: {
          tenantId: newTenant.id,
          name: adminName,
          email: contactEmail.toLowerCase(),
          passwordHash,
          role: UserRole.BUSINESS_ADMIN,
        },
      });

      return newTenant;
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.", data: { slug: tenant.slug } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
