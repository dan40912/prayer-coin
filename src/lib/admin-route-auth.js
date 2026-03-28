import { NextResponse } from "next/server";

import { readAdminSessionFromRequest } from "@/lib/admin-session";

const DEFAULT_ROLES = new Set(["SUPER", "ADMIN"]);

export function requireAdmin(request, roles = DEFAULT_ROLES) {
  const session = readAdminSessionFromRequest(request);
  if (!session) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  if (roles && !roles.has(session.role)) {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      session,
    };
  }

  return { error: null, session };
}

export function roleSet(...roles) {
  return new Set(roles);
}
