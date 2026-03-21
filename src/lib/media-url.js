const AUDIO_EXTENSION_PATTERN =
  /\.(mp3|wav|m4a|aac|ogg|oga|webm|opus|flac|mp4|m4b|mpeg|mpga)(?:$|[?#])/i;
const HTML_EXTENSION_PATTERN = /\.(html?|php|aspx?)(?:$|[?#])/i;
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

export function normalizeMediaUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  const normalized = raw.replace(/\\/g, "/");
  if (normalized.startsWith("//")) return normalized;
  if (SCHEME_PATTERN.test(normalized)) return normalized;
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized}`;
}

export function isLikelyAudioUrl(value) {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) return false;

  if (normalized.startsWith("blob:")) return true;
  if (normalized.startsWith("data:audio/")) return true;
  if (normalized.startsWith("/voices/")) return true;
  if (normalized.startsWith("/api/")) return true;

  if (HTML_EXTENSION_PATTERN.test(normalized)) return false;
  if (AUDIO_EXTENSION_PATTERN.test(normalized)) return true;

  // Keep external/unknown streams playable unless they are clearly non-audio.
  return true;
}

export function normalizeAudioUrl(value) {
  const normalized = normalizeMediaUrl(value);
  return isLikelyAudioUrl(normalized) ? normalized : "";
}
