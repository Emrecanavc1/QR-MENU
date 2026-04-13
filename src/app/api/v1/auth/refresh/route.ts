import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ success: false, error: "Refresh token bulunamadı" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 401 });
  }

  const newPayload = { userId: user.id, tenantId: user.tenantId, role: user.role, email: user.email };
  const newAccessToken = await signAccessToken(newPayload);
  const newRefreshToken = await signRefreshToken(newPayload);

  const response = NextResponse.json({ success: true });
  response.cookies.set("access_token", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 3600, path: "/" });
  response.cookies.set("refresh_token", newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800, path: "/" });
  return response;
}
