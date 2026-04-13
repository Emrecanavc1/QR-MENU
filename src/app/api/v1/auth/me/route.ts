import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return NextResponse.json({ success: false }, { status: 401 });

  const payload = await verifyAccessToken(token);
  if (!payload) return NextResponse.json({ success: false }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, tenantId: true, tenant: { select: { id: true, name: true, slug: true, primaryColor: true } } },
  });

  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json({ success: true, data: { user } });
}
