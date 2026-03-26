import path from "node:path";
import { readFile, stat } from "node:fs/promises";

import { NextResponse } from "next/server";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

function resolveUploadPath(segments = []) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  const safeSegments = segments
    .map((segment) => (typeof segment === "string" ? segment.trim() : ""))
    .filter(Boolean);

  if (safeSegments.length !== segments.length) {
    return null;
  }

  const resolvedPath = path.resolve(UPLOAD_ROOT, ...safeSegments);
  if (!resolvedPath.startsWith(`${UPLOAD_ROOT}${path.sep}`) && resolvedPath !== UPLOAD_ROOT) {
    return null;
  }

  return resolvedPath;
}

async function buildUploadResponse(params, includeBody) {
  const filePath = resolveUploadPath(params?.path);
  if (!filePath) {
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = new Headers({
      "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
      "Content-Length": String(fileStat.size),
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Last-Modified": fileStat.mtime.toUTCString(),
    });

    if (!includeBody) {
      return new NextResponse(null, { status: 200, headers });
    }

    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    console.error("serve upload failed:", error);
    return NextResponse.json({ message: "Failed to load file." }, { status: 500 });
  }
}

export async function GET(request, context) {
  return buildUploadResponse(context?.params, true);
}

export async function HEAD(request, context) {
  return buildUploadResponse(context?.params, false);
}
