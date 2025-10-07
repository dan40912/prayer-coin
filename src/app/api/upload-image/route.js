import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1024;
const WEBP_QUALITY = 75;
const JPEG_QUALITY = 80;

async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function sanitizeFileName(name = "") {
  const normalized = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "_");
  return normalized.slice(-80) || "avatar";
}

function pickSmallestBuffer(original, candidates) {
  let best = { ...original };

  for (const candidate of candidates) {
    if (!candidate?.buffer) continue;
    if (candidate.buffer.length < best.buffer.length) {
      best = candidate;
    }
  }

  return best;
}

export async function POST(request) {
  try {
    await ensureUploadDir();

    const data = await request.formData();
    const file = data.get("file");

    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "找不到可上傳的圖片檔案" }, { status: 400 });
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json({ message: "請選擇圖片檔案" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: "原始圖片大小不得超過 5MB" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const image = sharp(fileBuffer, { failOnError: false }).rotate();
    const metadata = await image.metadata();

    const needsResize =
      (metadata.width && metadata.width > MAX_DIMENSION) ||
      (metadata.height && metadata.height > MAX_DIMENSION);

    const resizeOptions = needsResize
      ? { width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true }
      : undefined;

    const webpImage = image.clone();
    if (resizeOptions) {
      webpImage.resize(resizeOptions);
    }
    const webpBuffer = await webpImage
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();

    const jpegImage = image.clone();
    if (resizeOptions) {
      jpegImage.resize(resizeOptions);
    }
    const jpegBuffer = await jpegImage
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const originalExtension =
      (metadata.format === "jpeg" ? "jpg" : metadata.format) ||
      path.extname(file.name).replace(/^\./, "").toLowerCase() ||
      "jpg";

    const best = pickSmallestBuffer(
      { buffer: fileBuffer, extension: originalExtension },
      [
        { buffer: webpBuffer, extension: "webp" },
        { buffer: jpegBuffer, extension: "jpg" },
      ]
    );

    const safeName = sanitizeFileName(file.name);
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}.${best.extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await writeFile(filePath, best.buffer);

    return NextResponse.json({
      message: "圖片上傳成功",
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("圖片上傳失敗:", error);
    return NextResponse.json({ message: "圖片上傳失敗" }, { status: 500 });
  }
}
