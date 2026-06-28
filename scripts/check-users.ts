import prisma from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    include: {
      profile: true
    }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
