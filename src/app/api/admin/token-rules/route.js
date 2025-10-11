import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/logger";
import { readTokenRewardRule, updateTokenRewardRule } from "@/lib/tokenRewards";

const SESSION_HEADER = "x-admin-role";
const ALLOWED_ROLES = new Set(["SUPER", "ADMIN"]);

function resolveAdminRole(request) {
  return request.headers.get(SESSION_HEADER) ?? "";
}

function hasAccess(request) {
  return ALLOWED_ROLES.has(resolveAdminRole(request));
}

export async function GET(request) {
  if (!hasAccess(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const rule = await readTokenRewardRule();
    const normalized = {
      ...rule,
      rewardTokens: Number(rule.rewardTokens ?? 0),
    };
    return NextResponse.json(normalized);
  } catch (error) {
    console.error("GET /api/admin/token-rules error:", error);
    if (error?.code === "P2021" || error?.code === "P2022") {
      return NextResponse.json({
        id: 1,
        rewardTokens: 10,
        observationDays: 3,
        allowedReports: 0,
      });
    }
    return NextResponse.json({ message: "Failed to load token rules" }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!hasAccess(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const role = resolveAdminRole(request);
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const updated = await updateTokenRewardRule({
      rewardTokens: payload.rewardTokens,
      observationDays: payload.observationDays,
      allowedReports: payload.allowedReports,
      updatedBy: role,
    });

    const normalized = {
      ...updated,
      rewardTokens: Number(updated.rewardTokens ?? 0),
    };

    await logAdminAction({
      action: "token-rules.update",
      message: "Updated token reward rules",
      metadata: {
        rewardTokens: normalized.rewardTokens,
        observationDays: normalized.observationDays,
        allowedReports: normalized.allowedReports,
      },
      requestPath: request.url,
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("PATCH /api/admin/token-rules error:", error);
    if (error?.code === "P2021" || error?.code === "P2022") {
      return NextResponse.json({ message: "Reward rule table unavailable. Run prisma migrate to create it." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update token rules" }, { status: 500 });
  }
}
