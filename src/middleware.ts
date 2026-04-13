import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// ─── Özel Domain Yönlendirmesi ────────────────────────────────────────────
// Örnek: flare.cafe-istanbul.com → platform'un [tenant]/masa/1 rotasına yönlenir
// Gerçek tenant slug'ı DB'den çekilmeli (burada header ile işaretliyoruz)
async function handleCustomDomain(request: NextRequest): Promise<NextResponse | null> {
  const host = request.headers.get("host") ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const platformHost = new URL(appUrl).host;
  const platformPrefix = (process.env.NEXT_PUBLIC_APP_NAME ?? "flare").toLowerCase().replace(/\s+/g, "");

  // Kendi domain'imizse işlem yok
  if (host === platformHost || host.startsWith("localhost") || host.startsWith("127.")) return null;

  // flare.cafe-istanbul.com → platform prefix kontrolü
  if (host.startsWith(`${platformPrefix}.`)) {
    const businessDomain = host.slice(platformPrefix.length + 1); // cafe-istanbul.com
    // Slug DB'den çekilir — middleware'de Prisma kullanamayız, Header ile geçiyoruz
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-custom-domain", businessDomain);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return null;
}

// Korumalı rotalar ve gerekli roller
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  "/admin": [UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN],
  "/waiter": [UserRole.WAITER, UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN],
  "/kitchen": [UserRole.KITCHEN, UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN],
  "/superadmin": [UserRole.SUPER_ADMIN],
};

export async function middleware(request: NextRequest) {
  // Özel domain kontrolü (ilk sırada)
  const domainResponse = await handleCustomDomain(request);
  if (domainResponse) return domainResponse;

  const { pathname } = request.nextUrl;

  // API rotalarını kontrol et
  if (pathname.startsWith("/api/v1/admin") || pathname.startsWith("/api/v1/superadmin")) {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Kimlik doğrulama gerekli" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Geçersiz veya süresi dolmuş token" },
        { status: 401 }
      );
    }

    // Super admin API kontrolü
    if (pathname.startsWith("/api/v1/superadmin") && payload.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Request header'a kullanıcı bilgisi ekle
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-tenant-id", payload.tenantId ?? "");
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Dashboard sayfaları için kontrol
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      const token = request.cookies.get("access_token")?.value;

      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const payload = await verifyAccessToken(token);
      if (!payload) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (!roles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/waiter/:path*",
    "/kitchen/:path*",
    "/superadmin/:path*",
    "/api/v1/admin/:path*",
    "/api/v1/superadmin/:path*",
    // Tüm istekler için domain kontrolü
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
