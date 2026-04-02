import prisma from "@/lib/prisma";

export async function ensureActiveCustomer(sessionOrUserId) {
  const session =
    sessionOrUserId && typeof sessionOrUserId === "object"
      ? sessionOrUserId
      : { userId: sessionOrUserId };

  if (!session?.userId) {
    const error = new Error("UNAUTHENTICATED");
    error.code = "UNAUTHENTICATED";
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      isBlocked: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      walletBalance: true,
      bscAddress: true,
      isAddressVerified: true,
      publicProfileEnabled: true,
      sessionVersion: true,
    },
  });

  if (!user) {
    const error = new Error("UNAUTHENTICATED");
    error.code = "UNAUTHENTICATED";
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error("ACCOUNT_BLOCKED");
    error.code = "ACCOUNT_BLOCKED";
    throw error;
  }

  if (
    Number.isInteger(session.sessionVersion) &&
    Number(user.sessionVersion ?? 0) !== Number(session.sessionVersion)
  ) {
    const error = new Error("UNAUTHENTICATED");
    error.code = "UNAUTHENTICATED";
    throw error;
  }

  return user;
}
