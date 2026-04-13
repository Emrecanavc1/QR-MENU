// Dosya depolama soyut katmanı
// STORAGE_PROVIDER=local  → public/uploads/
// STORAGE_PROVIDER=r2     → Cloudflare R2

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const PROVIDER = (process.env.STORAGE_PROVIDER ?? "local") as "local" | "r2";
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface UploadResult {
  url: string;
  key: string;
}

// ─── Desteklenen dosya tipleri ─────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Sadece JPG, PNG, WebP veya GIF yükleyebilirsiniz.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Dosya boyutu en fazla ${MAX_SIZE_MB}MB olabilir.`;
  return null;
}

// ─── Yerel disk yükleme ────────────────────────────────────────────────────

async function uploadToLocal(file: File, folder: string): Promise<UploadResult> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  return {
    url: `${PUBLIC_URL}/uploads/${folder}/${filename}`,
    key: `uploads/${folder}/${filename}`,
  };
}

// ─── Cloudflare R2 / AWS S3 yükleme ─────────────────────────────────────────
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // AWS kullanılıyorsa endpoint yazılmaz
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function uploadToR2(file: File, folder: string): Promise<UploadResult> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${folder}/${randomUUID()}.${ext}`;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "";

  const buffer = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({ 
      Bucket: bucketName, 
      Key: key, 
      Body: buffer, 
      ContentType: file.type 
    })
  );

  const cdnUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.AWS_PUBLIC_URL || "";
  return { 
    url: `${cdnUrl}/${key}`, 
    key 
  };
}

// ─── Ana export ────────────────────────────────────────────────────────────

export async function uploadFile(file: File, folder: string = "general"): Promise<UploadResult> {
  if (PROVIDER === "r2") return uploadToR2(file, folder);
  return uploadToLocal(file, folder);
}

export async function deleteFile(key: string): Promise<void> {
  if (PROVIDER === "local") {
    const { unlink } = await import("fs/promises");
    try {
      await unlink(join(process.cwd(), "public", key));
    } catch {
      // Dosya bulunamazsa sessizce geç
    }
  } else if (PROVIDER === "r2") {
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "";
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );
    } catch {
      // Dosya bulunamazsa sessizce geç
    }
  }
}
