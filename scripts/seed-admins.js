const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_ADMINS = [
  { username: "admin", password: "admin", role: "SUPER" },
  { username: "dan40912", password: "1234", role: "ADMIN" },
];

async function main() {
  for (const admin of DEFAULT_ADMINS) {
    const username = admin.username.trim().toLowerCase();
    const existing = await prisma.adminAccount.findUnique({ where: { username } });
    if (existing) {
      continue;
    }

    const passwordHash = await bcrypt.hash(admin.password, 10);

    await prisma.adminAccount.create({
      data: {
        username,
        passwordHash,
        role: admin.role,
      },
    });

    console.log(`✓ 建立管理員 ${username} (${admin.role})`);
  }
}

main()
  .catch((error) => {
    console.error("建立預設管理員失敗:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
