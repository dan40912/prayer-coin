import prisma from "@/lib/prisma";

export async function ensureActiveCustomer(userId) {
  if (!userId) {
    const error = new Error("UNAUTHENTICATED");
    error.code = "UNAUTHENTICATED";
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isBlocked: true,
      email: true,
      name: true,
      username: true,
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

  return user;
}
