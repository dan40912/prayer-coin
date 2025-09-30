export function buildOvercomerSlug(user = {}) {
  const username = user?.username?.trim();
  if (!username) return "";
  return username;
}

export function parseOvercomerSlug(value) {
  if (!value || typeof value !== "string") return null;
  const decoded = decodeURIComponent(value.trim());
  if (!decoded) return null;
  return { username: decoded };
}
