import fs from "fs";
import path from "path";

import { normalizeAudioUrl } from "./media-url.js";
import {
  getMediaReadRoots,
  resolveMediaPathFromRoot,
} from "./server-media-storage.js";

const PUBLIC_ROOT = path.join(process.cwd(), "public");
const LOCAL_AUDIO_PREFIXES = ["/voices/", "/uploads/"];
const basenameIndexCache = new Map();

function isLocalPublicAudioPath(url) {
  return LOCAL_AUDIO_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function resolvePublicPathFromUrl(url) {
  return path.join(PUBLIC_ROOT, url.replace(/^\/+/, ""));
}

function resolveMediaPathsFromUrl(url) {
  const trimmed = typeof url === "string" ? url.trim() : "";
  const normalizedPath = trimmed.replace(/^\/+/, "");
  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length < 2) return [];

  const [kind, ...rest] = segments;
  if (kind !== "voices" && kind !== "uploads") return [];

  return getMediaReadRoots(kind)
    .map((root) => resolveMediaPathFromRoot(root, rest))
    .filter(Boolean);
}

function findByBasename(rootDir, basename) {
  const cacheKey = `${rootDir}:${basename}`;
  if (basenameIndexCache.has(cacheKey)) {
    return basenameIndexCache.get(cacheKey);
  }

  const matches = [];

  function walk(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (entry.isFile() && entry.name === basename) {
        matches.push(absolutePath);
      }
    }
  }

  walk(rootDir);
  const resolved = matches.length === 1 ? matches[0] : null;
  basenameIndexCache.set(cacheKey, resolved);
  return resolved;
}

export function resolveServerAudioUrl(value) {
  const normalized = normalizeAudioUrl(value);
  if (!normalized) return "";

  if (normalized.startsWith("blob:")) return "";
  if (normalized.startsWith("data:audio/")) return normalized;
  if (!isLocalPublicAudioPath(normalized)) return normalized;

  for (const candidatePath of resolveMediaPathsFromUrl(normalized)) {
    if (fs.existsSync(candidatePath)) {
      return normalized;
    }
  }

  const basename = path.basename(normalized);
  if (!basename) return "";

  const legacyPublicVoiceRoot = resolvePublicPathFromUrl("/voices");
  const fallbackPath = findByBasename(legacyPublicVoiceRoot, basename);
  if (!fallbackPath) return "";

  const relativePath = path
    .relative(PUBLIC_ROOT, fallbackPath)
    .replace(/\\/g, "/");
  return `/${relativePath}`;
}
