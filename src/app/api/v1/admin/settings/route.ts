import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true, slug: true, name: true, logoUrl: true, coverUrl: true,
      contactEmail: true, phone: true, address: true,
      currency: true, taxRate: true, timezone: true,
      primaryColor: true, wifiName: true, wifiPassword: true,
      instagramUrl: true, facebookUrl: true, twitterUrl: true,
      workingHours: true,
    },
  });

  if (!tenant) return NextResponse.json({ success: false, error: "İşletme bulunamadı" }, { status: 404 });
  return NextResponse.json({ success: true, data: { tenant } });
}

export async function PATCH(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  const body = await req.json();

  // Güvenli güncelleme — hassas alanlar (plan, status) değiştirilemez
  const {
    name, logoUrl, coverUrl, contactEmail, phone, address,
    currency, taxRate, primaryColor, wifiName, wifiPassword,
    instagramUrl, facebookUrl, twitterUrl, workingHours,
  } = body;

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(name && { name }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(contactEmail && { contactEmail }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(currency && { currency }),
      ...(taxRate !== undefined && { taxRate: parseFloat(taxRate) }),
      ...(primaryColor && { primaryColor }),
      ...(wifiName !== undefined && { wifiName }),
      ...(wifiPassword !== undefined && { wifiPassword }),
      ...(instagramUrl !== undefined && { instagramUrl }),
      ...(facebookUrl !== undefined && { facebookUrl }),
      ...(twitterUrl !== undefined && { twitterUrl }),
      ...(workingHours !== undefined && { workingHours }),
    },
  });

  return NextResponse.json({ success: true, data: { tenant: updated } });
}
