import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  const count = await prisma.scholarship.count();

  console.log("Scholarships:", count);

  const rows = await prisma.$queryRaw`
    SELECT
      COUNT(*) AS total,
      COUNT(embedding) AS embedded
    FROM "Scholarship";
  `;

  console.log(rows);
}

main().finally(async () => {
  await prisma.$disconnect();
});