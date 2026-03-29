#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const migrationsDir = path.join(repoRoot, "prisma", "migrations");
const outputFile = path.join(migrationsDir, "PROD_MIGRATION_BUNDLE.sql");

function isMigrationDir(name) {
  return /^\d{8,}_.+/.test(name);
}

if (!fs.existsSync(migrationsDir)) {
  console.error("[bundle] prisma/migrations not found.");
  process.exit(1);
}

const entries = fs
  .readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && isMigrationDir(d.name))
  .map((d) => d.name)
  .sort();

if (!entries.length) {
  console.error("[bundle] no migration folders found.");
  process.exit(1);
}

const now = new Date().toISOString();
const chunks = [];
chunks.push("-- PROD migration bundle generated at: " + now);
chunks.push("-- Source: prisma/migrations/*/migration.sql");
chunks.push("-- NOTE: Prefer running `npx prisma migrate deploy` in production.");
chunks.push("-- This bundle is for DBA review / controlled SQL execution.");
chunks.push("");

for (const name of entries) {
  const sqlPath = path.join(migrationsDir, name, "migration.sql");
  if (!fs.existsSync(sqlPath)) {
    continue;
  }
  const sql = fs.readFileSync(sqlPath, "utf8").trim();
  chunks.push("-- ==============================");
  chunks.push(`-- MIGRATION: ${name}`);
  chunks.push("-- ==============================");
  chunks.push(sql);
  chunks.push("");
}

fs.writeFileSync(outputFile, chunks.join("\n"), "utf8");
console.log(`[bundle] wrote ${outputFile}`);
console.log(`[bundle] total migrations: ${entries.length}`);