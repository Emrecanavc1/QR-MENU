import { NextRequest, NextResponse } from "next/server";
import { uploadFile, validateFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "general";

    if (!file) return NextResponse.json({ success: false, error: "Dosya bulunamadı" }, { status: 400 });

    const validationError = validateFile(file);
    if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });

    const result = await uploadFile(file, `${tenantId}/${folder}`);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Dosya yüklenemedi" }, { status: 500 });
  }
}

// Next.js body parser'ı devre dışı bırak (formData için)
export const config = { api: { bodyParser: false } };
