const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

export function getYoutubeVideoId(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase();

    if (SHORT_HOSTS.has(hostname)) {
      return sanitizeYoutubeId(url.pathname.split("/").filter(Boolean)[0] || "");
    }

    if (!YOUTUBE_HOSTS.has(hostname)) return "";

    if (url.pathname === "/watch") {
      return sanitizeYoutubeId(url.searchParams.get("v") || "");
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
      return sanitizeYoutubeId(parts[1] || "");
    }
  } catch {
    return "";
  }

  return "";
}

export function normalizeYoutubeUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;

  const videoId = getYoutubeVideoId(raw);
  if (!videoId) {
    throw new Error("請輸入有效的 YouTube 連結");
  }
  return raw;
}

export function buildYoutubeEmbedUrl(value) {
  const videoId = getYoutubeVideoId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function sanitizeYoutubeId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : "";
}
