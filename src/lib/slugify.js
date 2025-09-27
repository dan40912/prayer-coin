export function slugify(text = "") {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\.html$/i, "") // remove .html if present
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-") // allow CJK characters too
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}
