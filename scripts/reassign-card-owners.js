const { PrismaClient } = require("@prisma/client");

const TARGET_USERS = [
  "dan40912@gmail.com",
  "jay.wu@zerologix.com",
];

async function main() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      where: { email: { in: TARGET_USERS } },
      select: { id: true, email: true },
    });

    if (users.length !== TARGET_USERS.length) {
      const foundEmails = new Set(users.map((user) => user.email));
      const missing = TARGET_USERS.filter((email) => !foundEmails.has(email));
      throw new Error(`Missing users: ${missing.join(", ")}`);
    }

    const userMap = new Map(users.map((user) => [user.email, user.id]));

    const cards = await prisma.homePrayerCard.findMany({
      select: { id: true },
      orderBy: { id: "asc" },
    });

    if (cards.length === 0) {
      console.log("No prayer cards found. Nothing to update.");
      return;
    }

    const owners = TARGET_USERS.map((email) => ({
      email,
      id: userMap.get(email),
      count: 0,
    }));

    const updates = cards.map((card, index) => {
      const owner = owners[index % owners.length];
      owner.count += 1;
      return prisma.homePrayerCard.update({
        where: { id: card.id },
        data: { ownerId: owner.id },
      });
    });

    await prisma.$transaction(updates);

    console.log(`Updated ${cards.length} prayer cards.`);
    owners.forEach((owner) => {
      console.log(`- ${owner.email}: ${owner.count} cards`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to reassign prayer card owners:", error);
  process.exit(1);
});
