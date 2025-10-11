import prisma from "@/lib/prisma";

const SITE_SETTINGS_ID = 1;

async function ensureDefaults(record) {
  if (record) {
    return record;
  }

  return prisma.siteSetting.create({
    data: {
      id: SITE_SETTINGS_ID,
      maintenanceMode: false,
    },
  });
}

export async function readSiteSettings() {
  const record = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTINGS_ID },
  });

  return ensureDefaults(record);
}

export async function setMaintenanceMode({ maintenanceMode, updatedBy = null }) {
  if (typeof maintenanceMode !== "boolean") {
    throw new TypeError("maintenanceMode must be a boolean value");
  }

  return prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {
      maintenanceMode,
      updatedBy,
    },
    create: {
      id: SITE_SETTINGS_ID,
      maintenanceMode,
      updatedBy,
    },
  });
}

