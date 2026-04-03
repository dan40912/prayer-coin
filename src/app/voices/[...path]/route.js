import path from "node:path";
import { readFile, stat } from "node:fs/promises";

import { NextResponse } from "next/server";

import {
  getMediaReadRoots,
  resolveMediaPathFromRoot,
} from "@/lib/server-media-storage";

const CONTENT_TYPES = {
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".mp4": "audio/mp4",
  ".oga": "audio/ogg",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
};

function resolveVoicePaths(segments = []) {
  return getMediaReadRoots("voices")
    .map((root) => resolveMediaPathFromRoot(root, segments))
    .filter(Boolean);
}

async function buildVoiceResponse(params, includeBody) {
  const candidatePaths = resolveVoicePaths(params?.path);
  if (candidatePaths.length === 0) {
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }

  for (const filePath of candidatePaths) {
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        continue;
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
        continue;
      }

      console.error("serve voice failed:", error);
      return NextResponse.json(
        { message: "Failed to load file." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "File not found." }, { status: 404 });
}

export async function GET(request, context) {
  return buildVoiceResponse(context?.params, true);
}

export async function HEAD(request, context) {
  return buildVoiceResponse(context?.params, false);
}
