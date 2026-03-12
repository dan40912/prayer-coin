const GALLERY_PREFIX = "gallery::";

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function pushEntry(value, info, gallery) {
  const entry = normalizeString(value);
  if (!entry) return;
  if (entry.startsWith(GALLERY_PREFIX)) {
    const url = entry.slice(GALLERY_PREFIX.length).trim();
    if (url) gallery.push(url);
    return;
  }
  info.push(entry);
}

export function parseCardMeta(meta) {
  const info = [];
  const gallery = [];

  if (!meta) {
    return { info, gallery };
  }

  if (Array.isArray(meta)) {
    meta.forEach((item) => pushEntry(item, info, gallery));
    return { info, gallery };
  }

  if (typeof meta === "object") {
    if (Array.isArray(meta.info)) {
      meta.info.forEach((item) => pushEntry(item, info, gallery));
    }
    if (Array.isArray(meta.gallery)) {
      meta.gallery.forEach((url) => {
        const normalized = normalizeString(url);
        if (normalized) gallery.push(normalized);
      });
    }
    if (Array.isArray(meta.entries)) {
      meta.entries.forEach((item) => pushEntry(item, info, gallery));
    }
    return { info, gallery };
  }

  if (typeof meta === "string") {
    pushEntry(meta, info, gallery);
  }

  return { info, gallery };
}

export function buildCardMetaArray(info = [], gallery = []) {
  const normalizedInfo = (Array.isArray(info) ? info : [])
    .map((item) => normalizeString(item))
    .filter(Boolean);

  const normalizedGallery = (Array.isArray(gallery) ? gallery : [])
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, 3)
    .map((url) => `${GALLERY_PREFIX}${url}`);

  if (!normalizedInfo.length && !normalizedGallery.length) {
    return [];
  }

  return [...normalizedInfo, ...normalizedGallery];
}

export { GALLERY_PREFIX };
