import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

const RULE_ID = 1;

const DEFAULT_RULE = {
  rewardTokens: new Prisma.Decimal(10),
  observationDays: 3,
  allowedReports: 0,
};

function ensureDecimal(value) {
  if (value instanceof Prisma.Decimal) {
    return value;
  }
  if (typeof value === "number" || typeof value === "string") {
    return new Prisma.Decimal(value);
  }
  if (value && typeof value === "object" && typeof value.toString === "function") {
    return new Prisma.Decimal(value.toString());
  }
  return new Prisma.Decimal(0);
}

export async function readTokenRewardRule() {
  let record = await prisma.tokenRewardRule.findUnique({ where: { id: RULE_ID } });

  if (!record) {
    record = await prisma.tokenRewardRule.create({
      data: {
        id: RULE_ID,
        rewardTokens: DEFAULT_RULE.rewardTokens,
        observationDays: DEFAULT_RULE.observationDays,
        allowedReports: DEFAULT_RULE.allowedReports,
      },
    });
  }

  return record;
}

export async function updateTokenRewardRule({ rewardTokens, observationDays, allowedReports, updatedBy }) {
  const amount = ensureDecimal(
    rewardTokens !== undefined && rewardTokens !== null ? rewardTokens : DEFAULT_RULE.rewardTokens,
  );
  const days = Number.isFinite(Number(observationDays)) ? Math.max(1, Number(observationDays)) : DEFAULT_RULE.observationDays;
  const reports = Number.isFinite(Number(allowedReports)) ? Math.max(0, Number(allowedReports)) : DEFAULT_RULE.allowedReports;

  return prisma.tokenRewardRule.upsert({
    where: { id: RULE_ID },
    update: {
      rewardTokens: amount,
      observationDays: days,
      allowedReports: reports,
      updatedBy: updatedBy ?? null,
    },
    create: {
      id: RULE_ID,
      rewardTokens: amount,
      observationDays: days,
      allowedReports: reports,
      updatedBy: updatedBy ?? null,
    },
  });
}

export async function processPendingResponseRewardsForUser(userId) {
  if (!userId) {
    return { processed: 0 };
  }

  const rule = await readTokenRewardRule();
  const now = new Date();
  const eligibleResponses = await prisma.prayerResponse.findMany({
    where: {
      responderId: userId,
      rewardStatus: "PENDING",
      rewardEligibleAt: { not: null, lte: now },
    },
    select: {
      id: true,
      reportCount: true,
      isBlocked: true,
      tokensAwarded: true,
      homeCardId: true,
    },
  });

  if (!eligibleResponses.length) {
    return { processed: 0 };
  }

  let processed = 0;
  const rewardAmount = ensureDecimal(rule.rewardTokens ?? DEFAULT_RULE.rewardTokens);
  const allowedReports = Number(rule.allowedReports ?? DEFAULT_RULE.allowedReports);

  for (const response of eligibleResponses) {
    await prisma.$transaction(async (tx) => {
      if (response.isBlocked || response.reportCount > allowedReports) {
        await tx.prayerResponse.update({
          where: { id: response.id },
          data: {
            rewardStatus: "BLOCKED",
            rewardEvaluatedAt: now,
            isSettled: true,
          },
        });
        return false;
      }

      await tx.prayerResponse.update({
        where: { id: response.id },
        data: {
          rewardStatus: "REWARDED",
          rewardEvaluatedAt: now,
          isSettled: true,
          tokensAwarded: { increment: rewardAmount },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: rewardAmount },
        },
      });

      await tx.tokenTransaction.create({
        data: {
          userId,
          type: "EARN_RESPONSE",
          status: "COMPLETED",
          amount: rewardAmount,
          relatedResponseId: response.id,
          metadata: {
            ruleVersion: 1,
            ruleObservationDays: rule.observationDays,
            ruleAllowedReports: allowedReports,
          },
        },
      });

      return true;
    });

    processed += 1;
  }

  return { processed };
}
