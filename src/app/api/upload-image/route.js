import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { NextResponse } from "next/server";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 78;

async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function sanitizeFileStem(name = "") {
  const parsed = path.parse(name);
  const source = parsed.name || "image";
  const normalized = source.toLowerCase().replace(/[^a-z0-9._-]+/g, "_");
  return normalized.slice(-80) || "image";
}

export async function POST(request) {
  try {
    await ensureUploadDir();

    const data = await request.formData();
    const file = data.get("file");

    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "找不到上傳的圖片檔案" }, { status: 400 });
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json({ message: "只允許上傳圖片檔案" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: "圖片大小不可超過 10MB" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let compressedBuffer;
    try {
      compressedBuffer = await sharp(fileBuffer, { failOnError: true })
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toBuffer();
    } catch {
      return NextResponse.json({ message: "圖片格式無法處理，請改用 JPG、PNG 或 WEBP" }, { status: 400 });
    }

    const safeName = sanitizeFileStem(file.name);
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}.webp`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await writeFile(filePath, compressedBuffer);

    return NextResponse.json({
      message: "圖片上傳成功",
      url: `/uploads/${filename}`,
      compressed: true,
    });
  } catch (error) {
    console.error("upload-image failed:", error);
    return NextResponse.json({ message: "圖片上傳失敗，請稍後再試" }, { status: 500 });
  }
}
