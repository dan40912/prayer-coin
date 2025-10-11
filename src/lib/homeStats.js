import prisma from "./prisma";

export async function readHomeStats() {
  const [totalPrayerCards, totalUsers, totalVoiceResponses] = await Promise.all([
    prisma.homePrayerCard.count({ where: { isBlocked: false } }),
    prisma.user.count({ where: { isBlocked: false } }),
    prisma.prayerResponse.count({
      where: {
        voiceUrl: { not: null },
        isBlocked: false,
      },
    }),
  ]);

  return {
    totalPrayerCards,
    totalUsers,
    totalVoiceResponses,
  };
}
