import prisma from "@/lib/prisma";

function slugify(input) {
  if (!input) return "";
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeCategory(record) {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description ?? "",
    sortOrder: record.sortOrder ?? 0,
    isActive: Boolean(record.isActive)
  };
}

export async function readActiveCategories() {
  const records = await prisma.$queryRaw`
    SELECT id, name, slug, description, sortOrder, isActive
    FROM home_prayer_category
    WHERE isActive = TRUE
    ORDER BY sortOrder ASC, id ASC
  `;
  return records.map(normalizeCategory);
}

export async function readAllCategories() {
  const records = await prisma.$queryRaw`
    SELECT id, name, slug, description, sortOrder, isActive
    FROM home_prayer_category
    ORDER BY sortOrder ASC, id ASC
  `;
  return records.map(normalizeCategory);
}

export async function createCategory(payload) {
  if (!payload?.name) {
    throw new Error("Name is required");
  }

  const name = payload.name.trim();
  const desiredSlug = payload.slug?.trim() || name;
  const normalizedSlug = slugify(desiredSlug) || slugify(`${name}-${Date.now()}`);

  await prisma.$executeRaw`
    INSERT INTO home_prayer_category (name, slug, description, sortOrder, isActive)
    VALUES (
      ${name},
      ${normalizedSlug},
      ${payload.description?.trim() || ""},
      ${Number.isFinite(payload.sortOrder) ? payload.sortOrder : 0},
      ${payload.isActive !== false}
    )
  `;

  const records = await prisma.$queryRaw`
    SELECT id, name, slug, description, sortOrder, isActive
    FROM home_prayer_category
    WHERE slug = ${normalizedSlug}
    ORDER BY id DESC
    LIMIT 1
  `;

  if (!records.length) {
    throw new Error("Failed to create category");
  }

  return normalizeCategory(records[0]);
}

export async function updateCategory(id, payload) {
  const existing = await prisma.$queryRaw`
    SELECT id FROM home_prayer_category WHERE id = ${id}
  `;

  if (!existing.length) {
    throw new Error("Category not found");
  }

  const name = payload.name?.trim() || null;
  const desiredSlug = payload.slug?.trim() || null;
  const normalizedSlug = desiredSlug ? slugify(desiredSlug) || slugify(`${desiredSlug}-${id}`) : null;
  const description = payload.description?.trim() || null;
  const sortOrder = Number.isFinite(payload.sortOrder) ? payload.sortOrder : null;
  const isActive = typeof payload.isActive === "boolean" ? payload.isActive : null;

  await prisma.$executeRaw`
    UPDATE home_prayer_category
    SET
      name = COALESCE(${name}, name),
      slug = COALESCE(${normalizedSlug}, slug),
      description = COALESCE(${description}, description),
      sortOrder = COALESCE(${sortOrder}, sortOrder),
      isActive = COALESCE(${isActive}, isActive),
      updatedAt = NOW()
    WHERE id = ${id}
  `;

  const records = await prisma.$queryRaw`
    SELECT id, name, slug, description, sortOrder, isActive
    FROM home_prayer_category
    WHERE id = ${id}
  `;

  return normalizeCategory(records[0]);
}