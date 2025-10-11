import sanitizeHtml from "sanitize-html";

const DISPLAY_ALLOWED_TAGS = [
  "p",
  "span",
  "br",
  "strong",
  "em",
  "i",
  "b",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "img"
];

const DISPLAY_ALLOWED_ATTRIBUTES = {
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  "*": ["class"]
};

const DISPLAY_ALLOWED_SCHEMES = ["http", "https", "mailto", "tel"];

function ensureSafeRel(attribs = {}) {
  const relValues = new Set(
    (attribs.rel || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => value.toLowerCase())
  );
  relValues.add("noopener");
  relValues.add("noreferrer");

  return Array.from(relValues).join(" ");
}

export function sanitizeHtmlForDisplay(html = "") {
  if (typeof html !== "string") return null;
  const trimmed = html.trim();
  if (!trimmed) return null;

  const sanitized = sanitizeHtml(trimmed, {
    allowedTags: DISPLAY_ALLOWED_TAGS,
    allowedAttributes: DISPLAY_ALLOWED_ATTRIBUTES,
    allowedSchemes: DISPLAY_ALLOWED_SCHEMES,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: ensureSafeRel(attribs)
        }
      })
    }
  }).trim();

  return sanitized || null;
}

export function sanitizeHtmlToPlainText(html = "") {
  if (typeof html !== "string") return "";
  const stripped = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  });

  return stripped.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();
}
