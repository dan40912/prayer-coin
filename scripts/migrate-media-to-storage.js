const fs = require("fs");
const path = require("path");

const {
  ensureConfiguredRoot,
  getLegacyRoot,
  resolvePathWithinRoot,
} = require("./lib/media-storage.cjs");

const APPLY = process.argv.includes("--apply");
const SHOW_HELP = process.argv.includes("--help") || process.argv.includes("-h");
const MEDIA_KINDS = ["voices", "uploads"];

function usage() {
  console.log([
    "Usage:",
    "  node scripts/migrate-media-to-storage.js",
    "  node scripts/migrate-media-to-storage.js --apply",
    "",
    "Notes:",
    "  - Dry-run by default.",
    "  - Requires VOICES_STORAGE_DIR and UPLOADS_STORAGE_DIR to be set.",
    "  - Copies files to external storage without deleting source files.",
  ].join("\n"));
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];

  const queue = [root];
  const results = [];

  while (queue.length > 0) {
    const current = queue.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }

  return results.sort();
}

function ensureDistinctRoots(kind, sourceRoot, targetRoot) {
  const normalizedSource = path.resolve(sourceRoot);
  const normalizedTarget = path.resolve(targetRoot);
  if (
    normalizedSource === normalizedTarget ||
    normalizedSource.startsWith(`${normalizedTarget}${path.sep}`) ||
    normalizedTarget.startsWith(`${normalizedSource}${path.sep}`)
  ) {
    throw new Error(
      `${kind}: source and target roots must be separate directories.`
    );
  }
}

function classifyTarget(sourcePath, targetPath) {
  if (!fs.existsSync(targetPath)) {
    return "copy";
  }

  const sourceStat = fs.statSync(sourcePath);
  const targetStat = fs.statSync(targetPath);
  if (
    sourceStat.size === targetStat.size &&
    Math.floor(sourceStat.mtimeMs) === Math.floor(targetStat.mtimeMs)
  ) {
    return "skip";
  }

  return "overwrite";
}

function migrateKind(kind) {
  const sourceRoot = getLegacyRoot(kind);
  const targetRoot = ensureConfiguredRoot(kind);
  ensureDistinctRoots(kind, sourceRoot, targetRoot);

  const sourceFiles = walkFiles(sourceRoot);
  const summary = {
    kind,
    sourceRoot,
    targetRoot,
    totalFiles: sourceFiles.length,
    copy: 0,
    overwrite: 0,
    skip: 0,
  };

  console.log(`\n[media:migrate] ${kind}`);
  console.log(`  source: ${sourceRoot}`);
  console.log(`  target: ${targetRoot}`);

  if (sourceFiles.length === 0) {
    console.log("  no source files found");
    return summary;
  }

  for (const sourcePath of sourceFiles) {
    const relativePath = path.relative(sourceRoot, sourcePath);
    const targetPath = resolvePathWithinRoot(targetRoot, relativePath);
    if (!targetPath) {
      throw new Error(`${kind}: invalid target path for ${relativePath}`);
    }

    const action = classifyTarget(sourcePath, targetPath);
    summary[action] += 1;

    console.log(`  ${action.toUpperCase()} ${relativePath}`);
    if (!APPLY || action === "skip") {
      continue;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    const sourceStat = fs.statSync(sourcePath);
    fs.utimesSync(targetPath, sourceStat.atime, sourceStat.mtime);
  }

  return summary;
}

function main() {
  if (SHOW_HELP) {
    usage();
    return;
  }

  const summaries = MEDIA_KINDS.map((kind) => migrateKind(kind));
  const totals = summaries.reduce(
    (acc, item) => {
      acc.totalFiles += item.totalFiles;
      acc.copy += item.copy;
      acc.overwrite += item.overwrite;
      acc.skip += item.skip;
      return acc;
    },
    { totalFiles: 0, copy: 0, overwrite: 0, skip: 0 }
  );

  console.log("\n[media:migrate] summary");
  console.log(`  mode: ${APPLY ? "apply" : "dry-run"}`);
  console.log(`  files scanned: ${totals.totalFiles}`);
  console.log(`  copy: ${totals.copy}`);
  console.log(`  overwrite: ${totals.overwrite}`);
  console.log(`  skip: ${totals.skip}`);
}

try {
  main();
} catch (error) {
  console.error("[media:migrate] failed:", error.message);
  process.exit(1);
}
