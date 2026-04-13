import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "E-posta ve şifre gerekli" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: { select: { id: true, slug: true, name: true, status: true } } },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Hesabınız devre dışı bırakılmış" },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    // Tenant kontrolü (super admin hariç)
    if (user.tenant && user.tenant.status === "SUSPENDED") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "İşletme hesabı askıya alınmış" },
        { status: 403 }
      );
    }

    // Son giriş tarihini güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
          email: user.email,
          name: user.name,
          tenant: user.tenant,
        },
      },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
