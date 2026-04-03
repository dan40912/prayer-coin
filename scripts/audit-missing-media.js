const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const {
  getProbeLocations,
} = require("./lib/media-storage.cjs");

const SHOW_HELP = process.argv.includes("--help") || process.argv.includes("-h");

function usage() {
  console.log([
    "Usage:",
    "  node scripts/audit-missing-media.js",
    "  node scripts/audit-missing-media.js --json tmp/media-audit.json",
    "",
    "Notes:",
    "  - Reports DB records that reference /voices/* or /uploads/* media.",
    "  - Classifies each record as storage_only, legacy_only, both, or missing.",
  ].join("\n"));
}

function readJsonOutputPath(argv) {
  const jsonFlagIndex = argv.indexOf("--json");
  if (jsonFlagIndex === -1) return null;
  const nextValue = argv[jsonFlagIndex + 1];
  if (!nextValue || nextValue.startsWith("--")) {
    throw new Error("--json requires a file path.");
  }
  return nextValue;
}

function exists(filePath) {
  return Boolean(filePath) && fs.existsSync(filePath);
}

function classifyMediaStatus(locations) {
  const inStorage = exists(locations.storagePath);
  const inLegacy = exists(locations.legacyPath);

  if (inStorage && inLegacy) return "both";
  if (inStorage) return "storage_only";
  if (inLegacy) return "legacy_only";
  return "missing";
}

function formatRecord(record) {
  const identityParts = [`${record.model}.${record.field}`];
  if (record.id !== undefined && record.id !== null) {
    identityParts.push(`id=${record.id}`);
  }
  if (record.slug) {
    identityParts.push(`slug=${record.slug}`);
  }
  if (record.email) {
    identityParts.push(`email=${record.email}`);
  }
  if (record.homeCardId) {
    identityParts.push(`homeCardId=${record.homeCardId}`);
  }

  return identityParts.join(" | ");
}

async function collectRecords(prisma) {
  const [responses, users, cards, banners] = await Promise.all([
    prisma.prayerResponse.findMany({
      select: {
        id: true,
        homeCardId: true,
        responderId: true,
        voiceUrl: true,
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
      },
    }),
    prisma.homePrayerCard.findMany({
      select: {
        id: true,
        slug: true,
        image: true,
        voiceHref: true,
      },
    }),
    prisma.siteBanner.findMany({
      select: {
        id: true,
        heroImage: true,
      },
    }),
  ]);

  return [
    ...responses.map((item) => ({
      model: "PrayerResponse",
      field: "voiceUrl",
      id: item.id,
      homeCardId: item.homeCardId,
      responderId: item.responderId,
      url: item.voiceUrl,
    })),
    ...users.map((item) => ({
      model: "User",
      field: "avatarUrl",
      id: item.id,
      email: item.email,
      username: item.username,
      url: item.avatarUrl,
    })),
    ...cards.flatMap((item) => [
      {
        model: "HomePrayerCard",
        field: "image",
        id: item.id,
        slug: item.slug,
        url: item.image,
      },
      {
        model: "HomePrayerCard",
        field: "voiceHref",
        id: item.id,
        slug: item.slug,
        url: item.voiceHref,
      },
    ]),
    ...banners.map((item) => ({
      model: "SiteBanner",
      field: "heroImage",
      id: item.id,
      url: item.heroImage,
    })),
  ].filter((record) => typeof record.url === "string" && record.url.trim());
}

function buildReport(records) {
  const details = records
    .map((record) => {
      const locations = getProbeLocations(record.url);
      if (!locations) {
        return null;
      }

      return {
        ...record,
        kind: locations.kind,
        relativePath: locations.relativePath,
        status: classifyMediaStatus(locations),
        storagePath: locations.storagePath,
        legacyPath: locations.legacyPath,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      return (
        left.status.localeCompare(right.status) ||
        left.kind.localeCompare(right.kind) ||
        left.model.localeCompare(right.model) ||
        String(left.id ?? "").localeCompare(String(right.id ?? ""))
      );
    });

  const summary = details.reduce(
    (acc, item) => {
      acc.total += 1;
      acc.byStatus[item.status] = (acc.byStatus[item.status] || 0) + 1;
      acc.byKind[item.kind] = (acc.byKind[item.kind] || 0) + 1;
      return acc;
    },
    {
      total: 0,
      byStatus: {
        both: 0,
        storage_only: 0,
        legacy_only: 0,
        missing: 0,
      },
      byKind: {
        voices: 0,
        uploads: 0,
      },
    }
  );

  return {
    generatedAt: new Date().toISOString(),
    summary,
    details,
  };
}

function printReport(report) {
  console.log("[media:audit] summary");
  console.log(`  total managed records: ${report.summary.total}`);
  for (const [status, count] of Object.entries(report.summary.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  for (const [kind, count] of Object.entries(report.summary.byKind)) {
    console.log(`  ${kind}: ${count}`);
  }

  const actionable = report.details.filter(
    (item) => item.status === "missing" || item.status === "legacy_only"
  );

  console.log("\n[media:audit] actionable items");
  if (actionable.length === 0) {
    console.log("  none");
    return;
  }

  for (const item of actionable) {
    console.log(`  [${item.status}] ${formatRecord(item)}`);
    console.log(`    url: ${item.url}`);
    console.log(`    storagePath: ${item.storagePath || "(not configured)"}`);
    console.log(`    legacyPath: ${item.legacyPath || "(n/a)"}`);
  }
}

async function main() {
  if (SHOW_HELP) {
    usage();
    return;
  }

  const jsonOutputPath = readJsonOutputPath(process.argv);
  const prisma = new PrismaClient();

  try {
    const records = await collectRecords(prisma);
    const report = buildReport(records);
    printReport(report);

    if (jsonOutputPath) {
      fs.mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
      fs.writeFileSync(jsonOutputPath, JSON.stringify(report, null, 2));
      console.log(`\n[media:audit] wrote json report to ${jsonOutputPath}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[media:audit] failed:", error.message);
  process.exit(1);
});
