import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/logger";
import { readSiteSettings, setMaintenanceMode } from "@/lib/siteSettings";

const SESSION_HEADER = "x-admin-role";
const ALLOWED_ROLES = new Set(["SUPER", "ADMIN"]);

function resolveAdminRole(request) {
  return request.headers.get(SESSION_HEADER) ?? "";
}

function ensureAdminAccess(request) {
  const role = resolveAdminRole(request);
  return ALLOWED_ROLES.has(role);
}

export async function GET(request) {
  if (!ensureAdminAccess(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const settings = await readSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/admin/site-settings error:", error);
    return NextResponse.json({ message: "Failed to load site settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!ensureAdminAccess(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const role = resolveAdminRole(request);

  try {
    const payload = await request.json().catch(() => null);
    const maintenanceMode = payload?.maintenanceMode;

    if (typeof maintenanceMode !== "boolean") {
      return NextResponse.json({ message: "maintenanceMode must be a boolean" }, { status: 400 });
    }

    const updated = await setMaintenanceMode({
      maintenanceMode,
      updatedBy: role || null,
    });

    await logAdminAction({
      action: maintenanceMode ? "maintenance.enable" : "maintenance.disable",
      message: maintenanceMode ? "Enabled maintenance mode" : "Disabled maintenance mode",
      requestPath: request.url,
      metadata: { maintenanceMode, role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/site-settings error:", error);
    return NextResponse.json({ message: "Failed to update site settings" }, { status: 500 });
  }
}
