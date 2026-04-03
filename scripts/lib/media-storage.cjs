const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const MEDIA_CONFIG = {
  voices: {
    envName: "VOICES_STORAGE_DIR",
    legacyRoot: path.join(PROJECT_ROOT, "public", "voices"),
    publicPrefix: "/voices/",
  },
  uploads: {
    envName: "UPLOADS_STORAGE_DIR",
    legacyRoot: path.join(PROJECT_ROOT, "public", "uploads"),
    publicPrefix: "/uploads/",
  },
};

function getMediaConfig(kind) {
  const config = MEDIA_CONFIG[kind];
  if (!config) {
    throw new Error(`Unsupported media storage kind: ${kind}`);
  }
  return config;
}

function getLegacyRoot(kind) {
  return getMediaConfig(kind).legacyRoot;
}

function getConfiguredRoot(kind) {
  const config = getMediaConfig(kind);
  const rawValue = process.env[config.envName]?.trim();
  return rawValue ? path.resolve(rawValue) : null;
}

function ensureConfiguredRoot(kind) {
  const configuredRoot = getConfiguredRoot(kind);
  if (configuredRoot) {
    return configuredRoot;
  }

  const config = getMediaConfig(kind);
  throw new Error(`${config.envName} is required.`);
}

function normalizeRelativePath(relativePath) {
  if (typeof relativePath !== "string") return null;
  const normalized = relativePath
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized.join("/") : null;
}

function resolvePathWithinRoot(root, relativePath) {
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  if (!root || !normalizedRelativePath) {
    return null;
  }

  const normalizedRoot = path.resolve(root);
  const resolvedPath = path.resolve(
    normalizedRoot,
    ...normalizedRelativePath.split("/")
  );
  if (
    resolvedPath !== normalizedRoot &&
    !resolvedPath.startsWith(`${normalizedRoot}${path.sep}`)
  ) {
    return null;
  }

  return resolvedPath;
}

function parseManagedUrl(url) {
  const rawUrl = typeof url === "string" ? url.trim() : "";
  if (!rawUrl) return null;

  for (const [kind, config] of Object.entries(MEDIA_CONFIG)) {
    if (!rawUrl.startsWith(config.publicPrefix)) {
      continue;
    }

    const relativePath = normalizeRelativePath(
      rawUrl.slice(config.publicPrefix.length).split(/[?#]/, 1)[0]
    );
    if (!relativePath) return null;

    return {
      kind,
      relativePath,
      url: rawUrl,
    };
  }

  return null;
}

function getProbeLocations(url) {
  const parsed = parseManagedUrl(url);
  if (!parsed) return null;

  const configuredRoot = getConfiguredRoot(parsed.kind);
  const legacyRoot = getLegacyRoot(parsed.kind);

  return {
    ...parsed,
    configuredRoot,
    legacyRoot,
    storagePath: configuredRoot
      ? resolvePathWithinRoot(configuredRoot, parsed.relativePath)
      : null,
    legacyPath: resolvePathWithinRoot(legacyRoot, parsed.relativePath),
  };
}

module.exports = {
  PROJECT_ROOT,
  ensureConfiguredRoot,
  getConfiguredRoot,
  getLegacyRoot,
  getMediaConfig,
  getProbeLocations,
  normalizeRelativePath,
  parseManagedUrl,
  resolvePathWithinRoot,
};
